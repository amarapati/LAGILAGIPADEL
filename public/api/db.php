<?php
/**
 * LagiLagiPadel - Database Connection (Hostinger / cPanel MySQL)
 * Credentials configured for hosting environment.
 */

// Database credentials
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'u372224362_llp';
$dbUser = getenv('DB_USER') ?: 'u372224362_llp_root';
$dbPass = getenv('DB_PASSWORD') ?: 'EzBdK~1u';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    // If localhost failed, attempt 127.0.0.1 as fallback (bypasses unix socket if misconfigured)
    if ($dbHost === 'localhost') {
        try {
            $dsnFallback = "mysql:host=127.0.0.1;port={$dbPort};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsnFallback, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e2) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Koneksi database MySQL gagal: ' . $e2->getMessage(),
                'hint'  => 'Pastikan nama database (u372224362_llp), username (u372224362_llp_root), dan password sudah sesuai di cPanel / Hostinger MySQL.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Koneksi database MySQL gagal: ' . $e->getMessage(),
            'hint'  => 'Pastikan nama database (u372224362_llp), username (u372224362_llp_root), dan password sudah sesuai di cPanel / Hostinger MySQL.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Function to auto-create tables if they do not exist
function ensureTablesExist(PDO $pdo) {
    static $checked = false;
    if ($checked) return;

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `tournaments` (
            `id` VARCHAR(191) NOT NULL PRIMARY KEY,
            `name` VARCHAR(255) NOT NULL,
            `status` VARCHAR(64) NOT NULL,
            `category` VARCHAR(255) DEFAULT NULL,
            `date` VARCHAR(64) DEFAULT NULL,
            `location` VARCHAR(255) DEFAULT NULL,
            `total_prize` VARCHAR(255) DEFAULT NULL,
            `data` LONGTEXT NOT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `members` (
            `id` VARCHAR(191) NOT NULL PRIMARY KEY,
            `name` VARCHAR(255) NOT NULL,
            `nickname` VARCHAR(255) DEFAULT NULL,
            `photo_url` TEXT DEFAULT NULL,
            `phone` VARCHAR(64) DEFAULT NULL,
            `email` VARCHAR(191) DEFAULT NULL,
            `city` VARCHAR(255) DEFAULT NULL,
            `gender` VARCHAR(64) DEFAULT NULL,
            `joined_date` VARCHAR(64) DEFAULT NULL,
            `status` VARCHAR(64) DEFAULT NULL,
            `is_group_qualified` INT DEFAULT 0,
            `qualified_tournament` VARCHAR(255) DEFAULT NULL,
            `qualified_pool` VARCHAR(64) DEFAULT NULL,
            `qualified_phase` VARCHAR(64) DEFAULT NULL,
            `achievements` TEXT DEFAULT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `tournament_groups` (
            `tournament_id` VARCHAR(191) NOT NULL PRIMARY KEY,
            `pools_json` LONGTEXT NOT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `brackets` (
            `tournament_id` VARCHAR(191) NOT NULL PRIMARY KEY,
            `bracket_json` LONGTEXT NOT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `referee_state` (
            `id` VARCHAR(191) NOT NULL PRIMARY KEY,
            `state_json` LONGTEXT NOT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `system_meta` (
            `key` VARCHAR(191) NOT NULL PRIMARY KEY,
            `value` LONGTEXT DEFAULT NULL,
            `updated_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `accounts` (
            `username` VARCHAR(64) NOT NULL PRIMARY KEY,
            `password` VARCHAR(64) NOT NULL,
            `account_type` VARCHAR(32) NOT NULL,
            `name` VARCHAR(255) DEFAULT NULL,
            `created_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed default accounts if table is empty
    $accCount = (int)$pdo->query("SELECT COUNT(*) FROM `accounts`")->fetchColumn();
    if ($accCount === 0) {
        $now = date('c');
        $initAccounts = [
            [
                'username' => 'admin',
                'password' => '9b5a9616c3149dca0a2c4d82d19b4650f6a7433673ea72e6d04fc8c57b44952b',
                'account_type' => 'admin',
                'name' => 'admin'
            ],
            [
                'username' => 'amarapati',
                'password' => '8e27902b278f2be3e676728c38f6b173e860901b1915c86e1a9af30fd7f35b0e',
                'account_type' => 'admin',
                'name' => 'amarapati'
            ],
            [
                'username' => 'wasit1',
                'password' => '2350370b5e70b82cea6a60b6200f3dabb422f0f8d8b85935f73e63906069009c',
                'account_type' => 'wasit',
                'name' => 'Wasit 1'
            ],
            [
                'username' => 'wasit2',
                'password' => '4b7f1c8a444c045172e4bad8f01f25476dd006e13d5fb8a225e34c6bc75a8b2e',
                'account_type' => 'wasit',
                'name' => 'Wasit 2'
            ],
            [
                'username' => 'wasit3',
                'password' => 'f3965c3cf29845f86beffc8b232d604198a0403549fe467325ac08fb2ac03552',
                'account_type' => 'wasit',
                'name' => 'Wasit 3'
            ],
            [
                'username' => 'wasit4',
                'password' => '218c16ce193e9013b36dc4f39e1e577db08773259714ca94c1a37bceaf6b46b6',
                'account_type' => 'wasit',
                'name' => 'Wasit 4'
            ],
            [
                'username' => 'wasit5',
                'password' => 'a24f35dc78869002cc13ea2849d642e869a89bd5c45108cebcf0f5de9121d2b5',
                'account_type' => 'wasit',
                'name' => 'Wasit 5'
            ],
            [
                'username' => 'wasit6',
                'password' => '1b303dc0cfc8ccb00c5cf9c8f1f96cf7d30a96f1aea647bebbfaea2f1e29a3ae',
                'account_type' => 'wasit',
                'name' => 'Wasit 6'
            ]
        ];

        $insAcc = $pdo->prepare("REPLACE INTO `accounts` (`username`, `password`, `account_type`, `name`, `created_at`) VALUES (:username, :password, :account_type, :name, :created_at)");
        foreach ($initAccounts as $acc) {
            $insAcc->execute([
                ':username' => $acc['username'],
                ':password' => $acc['password'],
                ':account_type' => $acc['account_type'],
                ':name' => $acc['name'],
                ':created_at' => $now
            ]);
        }
    }

    $checked = true;
}
