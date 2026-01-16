<?php
require 'config.php';

try {
    $pdo = getPDO();
    echo "Checking animals schema...<br>";

    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM animals LIKE 'image_path'");
    if ($stmt->fetch()) {
        echo "Column 'image_path' already exists.<br>";
    } else {
        $pdo->exec("ALTER TABLE animals ADD COLUMN image_path VARCHAR(255) DEFAULT NULL AFTER emoji");
        echo "Added column 'image_path' to animals table.<br>";
    }

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
?>
