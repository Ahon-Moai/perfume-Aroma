<?php
/**
 * Admin User Creation CLI Tool
 * Usage: php database/create_admin.php <username> <email> <password>
 */

if (php_sapi_name() !== 'cli') {
    die("This script can only be run from the command line interface.\n");
}

require_once __DIR__ . '/../api/config/config.php';
require_once __DIR__ . '/../api/db.php';

$username = $argv[1] ?? null;
$email = $argv[2] ?? null;
$password = $argv[3] ?? null;

if (!$username || !$email || !$password) {
    echo "Usage: php database/create_admin.php <username> <email> <password>\n";
    echo "Example: php database/create_admin.php superadmin admin@example.com SecretPass123!\n";
    exit(1);
}

if (strlen($password) < 6) {
    echo "Error: Password must be at least 6 characters long.\n";
    exit(1);
}

$db = Database::getConnection();

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $db->prepare("SELECT id FROM admin_users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    $existing = $stmt->fetch();

    if ($existing) {
        $updateStmt = $db->prepare("UPDATE admin_users SET username = ?, email = ?, password_hash = ? WHERE id = ?");
        $updateStmt->execute([$username, $email, $hash, $existing['id']]);
        echo "Successfully updated existing admin user ID {$existing['id']} ('$username').\n";
    } else {
        $insertStmt = $db->prepare("INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, 'admin')");
        $insertStmt->execute([$username, $email, $hash]);
        echo "Successfully created new admin user '$username' ($email).\n";
    }
} catch (\Exception $e) {
    echo "Error creating admin user: " . $e->getMessage() . "\n";
    exit(1);
}
