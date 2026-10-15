<?php
/**
 * Admin Authentication REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();
initSession();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($method === 'POST' ? 'login' : 'me');

if ($action === 'login' && $method === 'POST') {
    $input = getJsonInput();
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        jsonError('Username/email and password are required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonError('Invalid credentials', 401);
    }

    // Security: regenerate session ID on login
    session_regenerate_id(true);
    $_SESSION['admin_user_id'] = $user['id'];
    $_SESSION['admin_user'] = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ];

    $csrfToken = getCsrfToken();

    // Log action
    $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, 'login', 'admin_users', ?, ?)");
    $logStmt->execute([$user['id'], $user['id'], $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);

    jsonResponse([
        'user' => $_SESSION['admin_user'],
        'csrf_token' => $csrfToken
    ], 200, 'Login successful');

} elseif ($action === 'logout' && ($method === 'POST' || $method === 'GET')) {
    $userId = $_SESSION['admin_user_id'] ?? null;
    if ($userId) {
        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, 'logout', 'admin_users', ?, ?)");
        $logStmt->execute([$userId, $userId, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
    }

    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();

    jsonResponse(null, 200, 'Logged out successfully');

} elseif ($action === 'me' && $method === 'GET') {
    if (empty($_SESSION['admin_user_id'])) {
        jsonError('Unauthenticated', 401);
    }

    $csrfToken = getCsrfToken();
    jsonResponse([
        'user' => $_SESSION['admin_user'],
        'csrf_token' => $csrfToken
    ], 200, 'Authenticated admin user');

} else {
    jsonError('Unsupported authentication action', 400);
}
