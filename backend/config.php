<?php
// backend/config.php

define('DB_HOST', 'localhost');
define('DB_NAME', 'kidapp');
define('DB_USER', 'root');
define('DB_PASS', ''); // for WAMP default is empty
define('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE'); // TODO: Replace with valid key

function getPDO(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }

    return $pdo;
}
