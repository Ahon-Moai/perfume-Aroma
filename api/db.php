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

                // Auto-create ML Perfume Inventory tables if missing
                try {
                    self::$instance->exec("CREATE TABLE IF NOT EXISTS perfume_inventory (
                        id VARCHAR(64) PRIMARY KEY,
                        product_id VARCHAR(64) NULL,
                        brand VARCHAR(100) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        bottle_size_ml DECIMAL(10,2) NOT NULL DEFAULT 100.00,
                        remaining_ml DECIMAL(10,2) NOT NULL DEFAULT 100.00,
                        low_stock_threshold_ml DECIMAL(10,2) NOT NULL DEFAULT 15.00,
                        notes TEXT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )");

                    $isSqlite = ($dbConfig['driver'] === 'sqlite');
                    $autoInc = $isSqlite ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "INT AUTO_INCREMENT PRIMARY KEY";
                    self::$instance->exec("CREATE TABLE IF NOT EXISTS inventory_transactions (
                        id {$autoInc},
                        inventory_id VARCHAR(64) NOT NULL,
                        order_id INT NULL,
                        transaction_type VARCHAR(50) NOT NULL,
                        change_ml DECIMAL(10,2) NOT NULL,
                        previous_ml DECIMAL(10,2) NOT NULL,
                        new_ml DECIMAL(10,2) NOT NULL,
                        notes TEXT NULL,
                        created_by VARCHAR(100) DEFAULT 'system',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )");

                    // Auto-create Search Logs table if missing
                    self::$instance->exec("CREATE TABLE IF NOT EXISTS search_logs (
                        id {$autoInc},
                        search_term VARCHAR(255) NOT NULL,
                        normalized_term VARCHAR(255) NOT NULL,
                        matched_product_id VARCHAR(64) NULL,
                        result_count INT NOT NULL DEFAULT 0,
                        ip_hash VARCHAR(64) NULL,
                        session_id VARCHAR(100) NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )");
                    self::$instance->exec("CREATE INDEX IF NOT EXISTS idx_search_normalized_term ON search_logs(normalized_term)");
                    self::$instance->exec("CREATE INDEX IF NOT EXISTS idx_search_created_at ON search_logs(created_at)");
                    self::$instance->exec("CREATE INDEX IF NOT EXISTS idx_search_matched_prod ON search_logs(matched_product_id)");
                    self::$instance->exec("CREATE INDEX IF NOT EXISTS idx_search_rate_limit ON search_logs(ip_hash, normalized_term, created_at)");

                    // Initial seed if inventory is empty
                    $chk = self::$instance->query("SELECT COUNT(*) FROM perfume_inventory")->fetchColumn();
                    if ($chk == 0) {
                        $prods = self::$instance->query("SELECT id, brand, name FROM products")->fetchAll();
                        $insInv = self::$instance->prepare("INSERT INTO perfume_inventory (id, product_id, brand, name, bottle_size_ml, remaining_ml, low_stock_threshold_ml, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        $insTx = self::$instance->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, 'initial_stock', ?, 0, ?, 'Initial system seed stock', 'system')");

                        foreach ($prods as $p) {
                            $invId = 'inv-' . substr(md5($p['id']), 0, 10);
                            $bottleSize = 100.00;
                            $remMl = 100.00;
                            $insInv->execute([$invId, $p['id'], $p['brand'], $p['name'], $bottleSize, $remMl, 15.00, 'Original master perfume bottle']);
                            $insTx->execute([$invId, $remMl, $remMl]);
                        }
                    }
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
