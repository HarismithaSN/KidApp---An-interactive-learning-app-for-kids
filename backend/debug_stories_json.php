<?php
require 'config.php';
try {
    $pdo = getPDO();
    $stmt = $pdo->query("SELECT title, image_path FROM stories WHERE id > (SELECT MAX(id) - 10 FROM stories) ORDER BY id DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
