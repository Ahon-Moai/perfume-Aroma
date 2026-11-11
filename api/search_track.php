<?php
/**
 * Public Search Tracking REST Endpoint
 *
 * Responsibilities:
 * - Records customer-submitted search queries (not keystrokes).
 * - Normalizes search terms (trims extra whitespace, case folding).
 * - Prevents duplicate submissions / spam rate-limiting (e.g. within 15 seconds from same IP).
 * - Resolves matched product ID if available (from parameter or query search).
 * - Tracks searches even when no matching product exists.
 * - Non-blocking, fast execution.
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    exit(0);
}

if ($method !== 'POST') {
    jsonError('Method not allowed', 405);
}

$input = getJsonInput();

$searchTerm = isset($input['term']) ? trim((string)$input['term']) : (isset($input['search']) ? trim((string)$input['search']) : '');

if (mb_strlen($searchTerm, 'UTF-8') < 2) {
    // Queries shorter than 2 characters are ignored
    jsonResponse(['tracked' => false, 'reason' => 'Term too short'], 200);
}

// 1. Normalize term: collapse whitespace, lowercase
$normalizedTerm = mb_strtolower(preg_replace('/\s+/', ' ', $searchTerm), 'UTF-8');
$normalizedTerm = trim($normalizedTerm);

// IP hash for privacy & deduplication
$remoteIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
// If multiple IPs in X-Forwarded-For, pick the first
if (strpos($remoteIp, ',') !== false) {
    $remoteIp = trim(explode(',', $remoteIp)[0]);
}
$ipHash = hash('sha256', $remoteIp . '_aromatica_salt');
$sessionId = sanitizeString($input['session_id'] ?? null);

$db = Database::getConnection();

// 2. Prevent duplicate submissions: check if identical normalized term was logged from same IP in the last 15 seconds
$dedupStmt = $db->prepare("
    SELECT id, created_at
    FROM search_logs
    WHERE ip_hash = ? AND normalized_term = ?
      AND created_at >= " . ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite'
        ? "datetime('now', '-15 seconds')"
        : "DATE_SUB(NOW(), INTERVAL 15 SECOND)") . "
    LIMIT 1
");
$dedupStmt->execute([$ipHash, $normalizedTerm]);
if ($dedupStmt->fetch()) {
    // Duplicate submission within 15s - acknowledge without duplicate inflation
    jsonResponse(['tracked' => false, 'reason' => 'Duplicate submission throttled'], 200);
}

// 3. Matched product resolution
$matchedProductId = sanitizeString($input['product_id'] ?? null);
$resultCount = isset($input['result_count']) ? max(0, (int)$input['result_count']) : null;

// If matchedProductId wasn't directly passed, attempt intelligent match by name, brand, or slug
if (!$matchedProductId) {
    $matchStmt = $db->prepare("
        SELECT id FROM products
        WHERE status = 'published' AND (
            LOWER(name) = ?
            OR LOWER(slug) = ?
            OR LOWER(brand) = ?
            OR LOWER(name) LIKE ?
        )
        ORDER BY
            CASE
                WHEN LOWER(name) = ? THEN 1
                WHEN LOWER(slug) = ? THEN 2
                WHEN LOWER(brand) = ? THEN 3
                ELSE 4
            END ASC
        LIMIT 1
    ");
    $likeTerm = '%' . $normalizedTerm . '%';
    $matchStmt->execute([
        $normalizedTerm,
        $normalizedTerm,
        $normalizedTerm,
        $likeTerm,
        $normalizedTerm,
        $normalizedTerm,
        $normalizedTerm
    ]);
    $matchedRow = $matchStmt->fetch();
    if ($matchedRow) {
        $matchedProductId = $matchedRow['id'];
    }
}

// If result_count wasn't provided, calculate matching products count
if ($resultCount === null) {
    $countStmt = $db->prepare("
        SELECT COUNT(*) FROM products
        WHERE status = 'published' AND (
            LOWER(name) LIKE ?
            OR LOWER(brand) LIKE ?
            OR LOWER(category) LIKE ?
            OR LOWER(notes) LIKE ?
        )
    ");
    $termWildcard = '%' . $normalizedTerm . '%';
    $countStmt->execute([$termWildcard, $termWildcard, $termWildcard, $termWildcard]);
    $resultCount = (int)$countStmt->fetchColumn();
}

// 4. Insert log entry
try {
    $insertStmt = $db->prepare("
        INSERT INTO search_logs (
            search_term,
            normalized_term,
            matched_product_id,
            result_count,
            ip_hash,
            session_id,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, " . ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite' ? "datetime('now')" : "NOW()") . ")
    ");
    $insertStmt->execute([
        $searchTerm,
        $normalizedTerm,
        $matchedProductId ?: null,
        $resultCount,
        $ipHash,
        $sessionId ?: null
    ]);

    jsonResponse([
        'tracked' => true,
        'normalized_term' => $normalizedTerm,
        'matched_product_id' => $matchedProductId,
        'result_count' => $resultCount
    ], 200);

} catch (\Exception $e) {
    // Search tracking should fail gracefully without disrupting shopper
    jsonResponse(['tracked' => false, 'error' => 'Logging failed'], 200);
}
