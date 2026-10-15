<?php
/**
 * Admin Store Settings REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $db->query("SELECT setting_key, setting_value FROM store_settings");
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];
    jsonResponse($settings, 200);

} elseif ($method === 'POST' || $method === 'PUT') {
    $input = getJsonInput();

    if (empty($input) || !is_array($input)) {
        jsonError('Settings payload missing or invalid', 400);
    }

    $config = require __DIR__ . '/../config/config.php';
    $isSqlite = ($config['db']['driver'] === 'sqlite');

    try {
        $db->beginTransaction();

        foreach ($input as $key => $val) {
            $key = sanitizeString($key);
            $val = is_array($val) ? json_encode($val) : (string)$val;

            if ($isSqlite) {
                $stmt = $db->prepare("INSERT INTO store_settings (setting_key, setting_value) VALUES (:key, :val) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value");
                $stmt->execute([':key' => $key, ':val' => $val]);
            } else {
                $stmt = $db->prepare("INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                $stmt->execute([$key, $val]);
            }
        }

        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, details) VALUES (?, 'update_settings', 'store_settings', 'Updated global store settings')");
        $logStmt->execute([$admin['id']]);

        $db->commit();
        jsonResponse(null, 200, 'Settings saved successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to save settings: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
