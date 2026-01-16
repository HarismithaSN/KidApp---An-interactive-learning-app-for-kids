<?php
require 'config.php';
try {
    $pdo = getPDO();
    $stmt = $pdo->query("DESCRIBE stories");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
