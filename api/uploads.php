<?php
/**
 * Secure File & Media Upload REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$config = require __DIR__ . '/config/config.php';
$db = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'POST') {
    jsonError('Method not allowed', 405);
}

if (!isset($_FILES['file']) && !isset($_FILES['image'])) {
    jsonError('No image file uploaded', 400);
}

$fileKey = isset($_FILES['file']) ? 'file' : 'image';
$file = $_FILES[$fileKey];

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonError('File upload failed with error code: ' . $file['error'], 400);
}

$maxSizeBytes = ($config['upload']['max_size_mb'] ?? 5) * 1024 * 1024;
if ($file['size'] > $maxSizeBytes) {
    jsonError('File size exceeds maximum allowed limit of ' . $config['upload']['max_size_mb'] . 'MB', 400);
}

// Check MIME type
$tmpPath = $file['tmp_name'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $tmpPath);
finfo_close($finfo);

$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp'
];

if (!array_key_exists($mimeType, $allowedMimeTypes)) {
    jsonError('Invalid file type. Only JPG, PNG, and WEBP images are allowed.', 400);
}

// Validate extension
$originalName = basename($file['name']);
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
    $ext = $allowedMimeTypes[$mimeType];
}

// Generate secure randomized filename
$newFilename = bin2hex(random_bytes(16)) . '.' . $ext;

$uploadDir = $config['upload']['dir'];
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$destinationPath = $uploadDir . '/' . $newFilename;

if (!move_uploaded_file($tmpPath, $destinationPath)) {
    jsonError('Failed to save uploaded file on server', 500);
}

// Set restrictive permissions
chmod($destinationPath, 0644);

$publicUrl = '/uploads/' . $newFilename;

// Store in DB
try {
    $stmt = $db->prepare("INSERT INTO media_files (filename, original_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$newFilename, $originalName, $publicUrl, $mimeType, $file['size']]);
    $mediaId = $db->lastInsertId();

    $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'upload_media', 'media_files', ?, ?)");
    $logStmt->execute([$admin['id'], $mediaId, "Uploaded media $originalName -> $newFilename"]);

    jsonResponse([
        'id' => $mediaId,
        'filename' => $newFilename,
        'original_name' => $originalName,
        'url' => $publicUrl,
        'file_type' => $mimeType,
        'file_size' => $file['size']
    ], 201, 'Image uploaded successfully');

} catch (\Exception $e) {
    jsonError('Failed to record media in database: ' . $e->getMessage(), 500);
}
