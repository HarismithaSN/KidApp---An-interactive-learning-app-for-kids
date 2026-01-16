<?php
require 'config.php';

try {
    $pdo = getPDO();
    echo "Updating animal images...<br>";

    $updates = [
        'Lion' => 'images/animals/lion.png',
        'Elephant' => 'images/animals/elephant.png',
        'Dog' => 'images/animals/dog.png',
        'Cat' => 'images/animals/cat.png',
        'Parrot' => 'images/animals/parrot.png',
        'Peacock' => 'images/animals/peacock.png',
        'Owl' => 'images/animals/owl.png',
        'Frog' => 'images/animals/frog.png',
        'Tiger' => 'images/animals/tiger.png',
        'Penguin' => 'images/animals/penguin.png'
    ];

    $stmt = $pdo->prepare("UPDATE animals SET image_path = ? WHERE name = ?");

    foreach ($updates as $name => $path) {
        $stmt->execute([$path, $name]);
        if ($stmt->rowCount() > 0) {
            echo "Updated image for: $name<br>";
        } else {
            echo "No change or not found: $name<br>";
        }
    }

    echo "Done updating animal images.";

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
?>
