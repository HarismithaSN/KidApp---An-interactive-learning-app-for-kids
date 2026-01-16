<?php
require 'config.php';
try {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT title, image_path FROM stories ORDER BY id DESC LIMIT 10");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($rows, true) . "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
