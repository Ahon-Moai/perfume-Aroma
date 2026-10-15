<?php
/**
 * Database Connection Manager (PDO Singleton)
 */

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $config = require __DIR__ . '/config/config.php';
            $dbConfig = $config['db'];

            try {
                if ($dbConfig['driver'] === 'sqlite') {
                    $dbFile = $dbConfig['file'];
                    $dbDir = dirname($dbFile);
                    if (!is_dir($dbDir)) {
                        mkdir($dbDir, 0755, true);
                    }
                    $dsn = "sqlite:" . $dbFile;
                    self::$instance = new PDO($dsn);
                    self::$instance->exec("PRAGMA foreign_keys = ON;");
                } else {
                    $dsn = sprintf(
                        "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
                        $dbConfig['host'],
                        $dbConfig['port'],
                        $dbConfig['name']
                    );
                    self::$instance = new PDO($dsn, $dbConfig['user'], $dbConfig['pass']);
                    self::$instance->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                }

                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            } catch (PDOException $e) {
                // Return safe error message without leaking DB credentials
                $msg = ($config['env'] === 'development') ? "Database connection error: " . $e->getMessage() : "Database connection failure";
                jsonError($msg, 500);
            }
        }
        return self::$instance;
    }
}
