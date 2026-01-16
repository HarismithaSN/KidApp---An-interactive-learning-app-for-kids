<?php
require 'db.php';

try {
    // $pdo is initialized in db.php
    if (!isset($pdo)) { die("Database connection failed in db.php"); }
    echo "Updating story images...<br>";

    $updates = [
        'Cinderella' => 'images/stories/cinderella_story_illustration_1766078884594.png',
        'The Monkey and the Crocodile' => 'images/stories/monkey_crocodile_story_illustration_1766078928725.png',
        'The Thirsty Crow' => 'images/stories/thirsty_crow_story_illustration_1766078948499.png',
        'The Lion and the Mouse' => 'images/stories/lion_mouse_story_illustration_1766078967469.png',
        'The Tortoise and the Hare' => 'images/stories/tortoise_hare_story_illustration_1766078986197.png',
        'The Boy Who Cried Wolf' => 'images/stories/boy_wolf.png'
    ];

    $stmt = $pdo->prepare("UPDATE stories SET image_path = ? WHERE title = ?");

    foreach ($updates as $title => $path) {
        // First check if story exists
        $check = $pdo->prepare("SELECT id FROM stories WHERE title = ?");
        $check->execute([$title]);
        if ($check->fetch()) {
            $stmt->execute([$path, $title]);
            echo "Updated image for: $title<br>";
        } else {
            echo "Story not found: $title<br>";
        }
    }

    echo "Done updating images.";

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
