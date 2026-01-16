<?php
require 'config.php';

try {
    $pdo = getPDO();
    echo "Checking database schema...<br>";

    // Add columns if they don't exist
    $cols = [
        "ADD COLUMN age INT DEFAULT 6",
        "ADD COLUMN fav_color VARCHAR(50) DEFAULT '#2196f3'",
        "ADD COLUMN fav_animal VARCHAR(50) DEFAULT '🐶'"
    ];

    foreach ($cols as $colSql) {
        try {
            $pdo->exec("ALTER TABLE users $colSql");
            echo "Executed: $colSql<br>";
        } catch (PDOException $e) {
            // Ignore "duplicate column" errors
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "Column already exists (skipped): $colSql<br>";
            } else {
                echo "Note: " . $e->getMessage() . "<br>";
            }
        }
    }
    
    echo "Schema update complete.";

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
