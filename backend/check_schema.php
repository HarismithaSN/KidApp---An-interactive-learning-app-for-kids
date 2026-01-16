<?php
require 'config.php';
try {
    $pdo = getPDO();
    $stmt = $pdo->query("DESCRIBE stories");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($columns, true) . "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
