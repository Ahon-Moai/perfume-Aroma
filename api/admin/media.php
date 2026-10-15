<?php
/**
 * Admin Media Library REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$config = require __DIR__ . '/../config/config.php';
$db = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM media_files ORDER BY created_at DESC");
    $files = $stmt->fetchAll();
    jsonResponse($files, 200);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        jsonError('Media file ID required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM media_files WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $media = $stmt->fetch();

    if (!$media) {
        jsonError('Media file not found', 404);
    }

    // Unlink physical file
    $filePath = $config['upload']['dir'] . '/' . $media['filename'];
    if (file_exists($filePath)) {
        @unlink($filePath);
    }

    // Remove DB record
    $delStmt = $db->prepare("DELETE FROM media_files WHERE id = ?");
    $delStmt->execute([$id]);

    $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'delete_media', 'media_files', ?, ?)");
    $logStmt->execute([$admin['id'], $id, "Deleted media file ID $id ({$media['filename']})"]);

    jsonResponse(null, 200, 'Media file deleted');

} else {
    jsonError('Method not allowed', 405);
}
