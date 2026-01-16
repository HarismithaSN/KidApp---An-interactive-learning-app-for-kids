<?php
require 'config.php';
try {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT id, name, emoji, image_path FROM animals");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($rows, true) . "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
