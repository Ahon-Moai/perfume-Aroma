<?php
/**
 * API Helpers & Security Utilities
 */

// Set secure CORS and JSON Headers
function sendCorsAndHeaders() {
    $config = require __DIR__ . '/config/config.php';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    $allowed = $config['allowed_origin'];

    if ($allowed === '*' || $allowed === $origin) {
        header("Access-Control-Allow-Origin: " . ($allowed === '*' ? '*' : $origin));
    } else {
        header("Access-Control-Allow-Origin: $allowed");
    }

    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("X-XSS-Protection: 1; mode=block");

    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($requestMethod === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Send structured JSON response
function jsonResponse($data = null, int $statusCode = 200, string $message = '') {
    http_response_code($statusCode);
    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'status' => $statusCode,
    ];

    if ($message !== '') {
        $response['message'] = $message;
    }

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Send structured error response
function jsonError(string $message, int $statusCode = 400, $errors = null) {
    http_response_code($statusCode);
    $response = [
        'success' => false,
        'status' => $statusCode,
        'error' => $message
    ];
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Read JSON input body
function getJsonInput() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return $_POST;
    }
    $decoded = json_decode($input, true);
    return is_array($decoded) ? $decoded : [];
}

// Start PHP session safely
function initSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_samesite', 'Lax');
        session_start();
    }
}

// Generate CSRF token
function getCsrfToken() {
    initSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Verify CSRF token
function verifyCsrfToken() {
    initSession();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;
    if (!$token || !hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        jsonError('Invalid or missing CSRF token', 403);
    }
}

// Verify Admin Session
function requireAdminAuth() {
    initSession();
    if (empty($_SESSION['admin_user_id'])) {
        jsonError('Unauthorized admin access required', 401);
    }
    return $_SESSION['admin_user'];
}

// Sanitize string
function sanitizeString($val) {
    if (is_null($val)) return null;
    return htmlspecialchars(trim((string)$val), ENT_QUOTES, 'UTF-8');
}

// Slugify string
function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'n-a' : $text;
}
