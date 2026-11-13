<?php
/**
 * Search tracking v2
 * - Called when a customer stops typing (debounced on the client), on Enter, or on tapping a result.
 * - Spelling-tolerant product / brand resolution.
 * - Merges partial typing: "bac" then "baccarat" from the same visitor within 90s becomes one search.
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/search_fuzzy.php';

sendCorsAndHeaders();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') exit(0);
if ($method !== 'POST') jsonError('Method not allowed', 405);

$input = getJsonInput();
$searchTerm = trim((string)($input['term'] ?? ''));
$searchTerm = mb_substr(preg_replace('/\s+/u', ' ', $searchTerm), 0, 120, 'UTF-8');
if (mb_strlen($searchTerm, 'UTF-8') < 2) {
    jsonResponse(['tracked' => false, 'reason' => 'Term too short'], 200);
}
$normalized = trim(mb_strtolower($searchTerm, 'UTF-8'));

$remoteIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (strpos($remoteIp, ',') !== false) $remoteIp = trim(explode(',', $remoteIp)[0]);
$ipHash = hash('sha256', $remoteIp . '_aromatica_salt');
$sessionId = sanitizeString($input['session_id'] ?? null);

$db = Database::getConnection();
$isSqlite = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';
$ago = fn(int $s) => $isSqlite ? "datetime('now', '-{$s} seconds')" : "DATE_SUB(NOW(), INTERVAL {$s} SECOND)";
$nowSql = $isSqlite ? "datetime('now')" : "NOW()";

// Resolve what the customer meant
$productId = sanitizeString($input['product_id'] ?? null) ?: null;
if (isset($input['result_count'])) {
    $resultCount = max(0, (int)$input['result_count']);
} else {
    $like = '%' . $normalized . '%';
    $cs = $db->prepare("SELECT COUNT(*) FROM products WHERE status = 'published' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(notes) LIKE ?)");
    $cs->execute([$like, $like, $like, $like]);
    $resultCount = (int)$cs->fetchColumn();
}
if (!$productId) {
    $fz = ppFuzzyResolve($db, $normalized);
    if ($fz['product_id']) {
        $productId = $fz['product_id'];
        $resultCount = max($resultCount, 1);
    } elseif ($fz['brand']) {
        $resultCount = max($resultCount, $fz['brand_count']);
    }
}

try {
    // Same visitor, same term just now -> ignore
    $dup = $db->prepare("SELECT id FROM search_logs WHERE ip_hash = ? AND normalized_term = ? AND created_at >= " . $ago(60) . " LIMIT 1");
    $dup->execute([$ipHash, $normalized]);
    if ($dup->fetch()) jsonResponse(['tracked' => false, 'reason' => 'Duplicate'], 200);

    // Same visitor kept typing ("bac" -> "baccarat", or "baccarat" -> "bacca") -> update the earlier row
    $recent = $db->prepare("SELECT id, normalized_term FROM search_logs WHERE ip_hash = ? AND created_at >= " . $ago(90) . " ORDER BY id DESC LIMIT 1");
    $recent->execute([$ipHash]);
    $prev = $recent->fetch();
    if ($prev) {
        $p = (string)$prev['normalized_term'];
        $isContinuation = (mb_strpos($normalized, $p, 0, 'UTF-8') === 0) || (mb_strpos($p, $normalized, 0, 'UTF-8') === 0);
        if ($isContinuation) {
            $keep = mb_strlen($normalized, 'UTF-8') >= mb_strlen($p, 'UTF-8');
            if ($keep) {
                $up = $db->prepare("UPDATE search_logs SET search_term = ?, normalized_term = ?, matched_product_id = ?, result_count = ?, created_at = $nowSql WHERE id = ?");
                $up->execute([$searchTerm, $normalized, $productId, $resultCount, $prev['id']]);
            }
            jsonResponse(['tracked' => true, 'merged' => true, 'matched_product_id' => $productId], 200);
        }
    }

    $ins = $db->prepare("INSERT INTO search_logs (search_term, normalized_term, matched_product_id, result_count, ip_hash, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?, $nowSql)");
    $ins->execute([$searchTerm, $normalized, $productId, $resultCount, $ipHash, $sessionId ?: null]);
    jsonResponse(['tracked' => true, 'matched_product_id' => $productId, 'result_count' => $resultCount], 200);
} catch (\Throwable $e) {
    jsonResponse(['tracked' => false, 'error' => 'Logging failed'], 200);
}
