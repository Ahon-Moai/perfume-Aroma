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

                // Auto-migrate missing columns if needed
                $columnsToEnsure = ['top_notes', 'heart_notes', 'base_notes', 'attributes_json', 'scent_profile_json'];
                foreach ($columnsToEnsure as $col) {
                    try {
                        self::$instance->exec("ALTER TABLE products ADD COLUMN {$col} TEXT NULL");
                    } catch (\Exception $e) {
                        // Column already exists or table not yet created
                    }
                }

                try {
                    self::$instance->exec("ALTER TABLE product_variants ADD COLUMN image VARCHAR(255) NULL");
                } catch (\Exception $e) {
                    // Column already exists
                }

                // Auto-create collections tables if missing
                try {
                    self::$instance->exec("CREATE TABLE IF NOT EXISTS collections (
                        id VARCHAR(64) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        slug VARCHAR(191) NOT NULL UNIQUE,
                        description TEXT NULL,
                        image VARCHAR(255) NULL,
                        rule_type VARCHAR(50) DEFAULT 'manual',
                        rule_value VARCHAR(100) NULL,
                        display_order INT DEFAULT 0,
                        is_enabled TINYINT(1) DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )");
                    self::$instance->exec("CREATE TABLE IF NOT EXISTS collection_products (
                        collection_id VARCHAR(64) NOT NULL,
                        product_id VARCHAR(64) NOT NULL,
                        PRIMARY KEY (collection_id, product_id)
                    )");
                } catch (\Exception $e) {
                    // Ignore migration errors
                }

            } catch (PDOException $e) {
                // Return safe error message without leaking DB credentials
                $msg = ($config['env'] === 'development') ? "Database connection error: " . $e->getMessage() : "Database connection failure";
                jsonError($msg, 500);
            }
        }
        return self::$instance;
    }
}
