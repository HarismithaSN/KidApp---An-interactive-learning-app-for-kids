<?php
$DB_HOST = 'localhost';
$DB_NAME = 'kidapp';
$DB_USER = 'root';
$DB_PASS = ''; // set if you have a password

try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB Connection failed']);
  exit;
}

?>
