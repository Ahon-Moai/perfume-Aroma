<?php
/**
 * Backend Health Check Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$config = require __DIR__ . '/config/config.php';

$dbConnected = false;
$dbDriver = $config['db']['driver'];
$dbError = null;

try {
    $db = Database::getConnection();
    if ($dbDriver === 'sqlite') {
        $stmt = $db->query("SELECT 1");
    } else {
        $stmt = $db->query("SELECT 1");
    }
    if ($stmt) {
        $dbConnected = true;
    }
} catch (\Throwable $e) {
    $dbConnected = false;
    $dbError = ($config['env'] === 'development') ? $e->getMessage() : 'Unable to connect to database';
}

$uploadDir = $config['upload']['dir'];
$uploadWritable = is_dir($uploadDir) && is_writable($uploadDir);

$statusData = [
    'app_name' => 'AROMATICA E-Commerce API',
    'status' => 'ok',
    'environment' => $config['env'],
    'timestamp' => date('c'),
    'database' => [
        'connected' => $dbConnected,
        'driver' => $dbDriver,
        'error' => $dbConnected ? null : $dbError
    ],
    'media_storage' => [
        'upload_dir_exists' => is_dir($uploadDir),
        'writable' => $uploadWritable
    ]
];

jsonResponse($statusData, $dbConnected ? 200 : 500, 'Health check result');
