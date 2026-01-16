<?php
require 'db.php';

try {
    $pdo = getPDO();
    echo "Updating schema for images...<br>";

    // Add image_path to stories
    $sql = "ADD COLUMN image_path VARCHAR(255) DEFAULT NULL";
    
    try {
        $pdo->exec("ALTER TABLE stories $sql");
        echo "Added image_path column.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Column image_path already exists.<br>";
        } else {
            echo "Error: " . $e->getMessage() . "<br>";
        }
    }

    echo "Done.";

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
