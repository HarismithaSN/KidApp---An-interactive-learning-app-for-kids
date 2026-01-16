<?php
// backend/update_new_story_images.php
require 'config.php';

try {
    $pdo = getPDO();
    
    // List of titles to fix
    $titlesToCheck = [
        'The Little Lamp That Never Gave Up',
        'Riya and the Broken Swing',
        'The Moon Who Felt Lonely',
        'The Talking Backpack',
        'The Shy Sparrow',
        'The Magic Chalk'
    ];

    $stmt = $pdo->prepare("UPDATE stories SET image_path = ? WHERE title = ?");

    foreach ($titlesToCheck as $title) {
        $key = '';
        if (strpos($title, 'Lamp') !== false) $key = 'little_lamp_story';
        if (strpos($title, 'Riya') !== false) $key = 'riya_swing_story';
        if (strpos($title, 'Moon') !== false) $key = 'moon_lonely_story';
        if (strpos($title, 'Backpack') !== false) $key = 'talking_backpack_story';
        if (strpos($title, 'Sparrow') !== false) $key = 'shy_sparrow_story';
        if (strpos($title, 'Magic') !== false) $key = 'magic_chalk_story';

        // Use __DIR__ to find the files correctly relative to this script
        $pattern = __DIR__ . "/../frontend/images/stories/{$key}_*.png";
        $files = glob($pattern);

        if (!empty($files)) {
            // Get the filename only
            $filename = basename($files[0]);
            $dbPath = "images/stories/$filename";
            
            $stmt->execute([$dbPath, $title]);
            echo "Updated '$title' -> $dbPath\n";
        } else {
            echo "Failed to find image for '$title' using pattern: $pattern\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
