<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getPDO();
    
    // Add parent_name if not exists
    $cols = $pdo->query("SHOW COLUMNS FROM users LIKE 'parent_name'")->fetchAll();
    if (count($cols) == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN parent_name VARCHAR(100) DEFAULT NULL AFTER name");
        echo "Added parent_name column.<br>";
    } else {
        echo "parent_name column already exists.<br>";
    }

    // Add parent_email if not exists
    $cols = $pdo->query("SHOW COLUMNS FROM users LIKE 'parent_email'")->fetchAll();
    if (count($cols) == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN parent_email VARCHAR(150) DEFAULT NULL AFTER parent_name");
        echo "Added parent_email column.<br>";
    } else {
        echo "parent_email column already exists.<br>";
    }

    echo "Database update completed.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
