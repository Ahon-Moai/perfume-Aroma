<?php
/**
 * Configuration loader and Environment Manager
 */

if (!function_exists('loadEnv')) {
    function loadEnv($path) {
        if (!file_exists($path)) {
            return;
        }
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) {
                continue;
            }
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);
                if ((strpos($val, '"') === 0 && substr($val, -1) === '"') ||
                    (strpos($val, "'") === 0 && substr($val, -1) === "'")) {
                    $val = substr($val, 1, -1);
                }
                if (!array_key_exists($key, $_ENV) && !array_key_exists($key, $_SERVER)) {
                    putenv("$key=$val");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
    }
}

if (!function_exists('env')) {
    function env($key, $default = null) {
        $val = getenv($key);
        if ($val === false) {
            $val = $_ENV[$key] ?? $_SERVER[$key] ?? $default;
        }
        if ($val === 'true') return true;
        if ($val === 'false') return false;
        return $val;
    }
}

// Root directory of application
$rootDir = realpath(__DIR__ . '/../../') ?: dirname(__DIR__, 2);

// Load root .env file
loadEnv($rootDir . '/.env');

// Configure error reporting
$appEnv = env('APP_ENV', 'production');
if ($appEnv === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

$dbFile = env('DB_FILE', $rootDir . '/database/aromatica.sqlite');
if ($dbFile && strpos($dbFile, '/') !== 0 && strpos($dbFile, ':') === false) {
    $dbFile = $rootDir . '/' . $dbFile;
}

return [
    'env' => $appEnv,
    'secret' => env('APP_SECRET', 'default_secret_please_change'),
    'allowed_origin' => env('ALLOWED_ORIGIN', '*'),
    'db' => [
        'driver' => env('DB_DRIVER', 'mysql'),
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'name' => env('DB_NAME', 'aromatica_db'),
        'user' => env('DB_USER', 'aromatica_user'),
        'pass' => env('DB_PASS', ''),
        'file' => $dbFile,
    ],
    'upload' => [
        'dir' => $rootDir . '/uploads',
        'public_path' => '/uploads',
        'max_size_mb' => (int)env('MAX_UPLOAD_SIZE_MB', 5),
    ]
];
