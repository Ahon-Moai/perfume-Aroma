<?php
/**
 * Admin Homepage CMS REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM homepage_sections ORDER BY display_order ASC");
    $sections = $stmt->fetchAll();

    foreach ($sections as &$sec) {
        $sec['content'] = json_decode($sec['content_json'], true);
    }

    jsonResponse($sections, 200);

} elseif ($method === 'PUT' || $method === 'POST') {
    $input = getJsonInput();
    $sectionKey = sanitizeString($input['section_key'] ?? $input['sectionKey'] ?? null);

    if (!$sectionKey) {
        jsonError('Section key is required', 400);
    }

    $title = sanitizeString($input['title'] ?? '');
    $subtitle = sanitizeString($input['subtitle'] ?? '');
    $isEnabled = isset($input['is_enabled']) ? ($input['is_enabled'] ? 1 : 0) : 1;
    $displayOrder = (int)($input['display_order'] ?? 0);
    $content = is_array($input['content'] ?? null) ? json_encode($input['content']) : json_encode([]);

    $config = require __DIR__ . '/../config/config.php';
    $isSqlite = ($config['db']['driver'] === 'sqlite');

    try {
        if ($isSqlite) {
            $stmt = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order, is_enabled) VALUES (:key, :title, :subtitle, :json, :order, :enabled) ON CONFLICT(section_key) DO UPDATE SET title=excluded.title, subtitle=excluded.subtitle, content_json=excluded.content_json, is_enabled=excluded.is_enabled, display_order=excluded.display_order");
            $stmt->execute([
                ':key' => $sectionKey,
                ':title' => $title,
                ':subtitle' => $subtitle,
                ':json' => $content,
                ':order' => $displayOrder,
                ':enabled' => $isEnabled
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order, is_enabled) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), content_json=VALUES(content_json), is_enabled=VALUES(is_enabled), display_order=VALUES(display_order)");
            $stmt->execute([$sectionKey, $title, $subtitle, $content, $displayOrder, $isEnabled]);
        }

        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'update_homepage_section', 'homepage_sections', ?, ?)");
        $logStmt->execute([$admin['id'], $sectionKey, "Updated section $sectionKey"]);

        jsonResponse(null, 200, "Section $sectionKey updated successfully");

    } catch (\Exception $e) {
        jsonError('Failed to update homepage section: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
