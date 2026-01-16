<?php
// backend/add_new_stories.php
require 'config.php';

try {
    $pdo = getPDO();
    
    // Check if stories already exist to avoid duplicates (by title)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM stories WHERE title = ?");
    
    $newStories = [
        [
            'title' => 'The Little Lamp That Never Gave Up',
            'content' => 'In a quiet village, there was a small oil lamp placed near a temple gate. Every night, strong winds tried to blow it out. Other lamps laughed and said, "You are too weak to shine." But the little lamp kept glowing, even with a tiny flame. One stormy night, all the big lamps went out, but the little lamp stayed on and helped travelers find their way. The village praised the lamp for its strength.',
            'moral' => 'Never give up, even when things are hard.',
            'image_path' => 'images/stories/little_lamp_story.png' 
        ],
        [
            'title' => 'Riya and the Broken Swing',
            'content' => 'Riya loved playing on the swing in the park. One day, it broke, and children were sad. Instead of complaining, Riya gathered her friends and cleaned the park. They asked elders for help, and together they fixed the swing. Soon, the park became more beautiful than before. Everyone thanked Riya.',
            'moral' => 'Taking responsibility makes a difference.',
            'image_path' => 'images/stories/riya_swing_story.png'
        ],
        [
            'title' => 'The Moon Who Felt Lonely',
            'content' => 'The moon watched children play every night but felt lonely. Stars were busy shining elsewhere. One night, the moon smiled brighter. Children looked up and waved. The moon felt happy knowing it was never truly alone.',
            'moral' => 'Kind thoughts bring happiness.',
            'image_path' => 'images/stories/moon_lonely_story.png'
        ],
        [
            'title' => 'The Talking Backpack',
            'content' => 'A boy named Karan had a backpack that whispered, "Be ready." When Karan forgot his homework or lunch, the backpack felt heavy. One day, Karan listened and packed properly. The bag felt light, and his day went smoothly. Karan learned to be responsible.',
            'moral' => 'Being prepared makes life easier.',
            'image_path' => 'images/stories/talking_backpack_story.png'
        ],
        [
            'title' => 'The Shy Sparrow',
            'content' => 'A sparrow was afraid to sing because its voice was soft. Other birds sang loudly. One morning, the forest was quiet, and the sparrow sang gently. The animals loved the calm tune. The sparrow smiled proudly.',
            'moral' => 'Every voice is important.',
            'image_path' => 'images/stories/shy_sparrow_story.png'
        ],
        [
            'title' => 'The Magic Chalk',
            'content' => 'A teacher gave her class a box of chalk that glowed when used kindly. When students shared and helped, the board shined brightly. When they fought, the glow disappeared. Soon, students chose kindness every day.',
            'moral' => 'Good behavior creates bright results.',
            'image_path' => 'images/stories/magic_chalk_story.png'
        ]
    ];

    // Note: I will need to check exact filenames after the move command. 
    // The previous move command used wildcards. 
    // I should get the actual filenames first to ensure mapping is correct.
    // However, I can rename them to match the expected names in the script.
    
    foreach ($newStories as $story) {
        $stmt->execute([$story['title']]);
        if ($stmt->fetchColumn() == 0) {
            // Find the actual file matching the key pattern
            $key = '';
            if (strpos($story['title'], 'Lamp') !== false) $key = 'little_lamp_story';
            if (strpos($story['title'], 'Riya') !== false) $key = 'riya_swing_story';
            if (strpos($story['title'], 'Moon') !== false) $key = 'moon_lonely_story';
            if (strpos($story['title'], 'Backpack') !== false) $key = 'talking_backpack_story';
            if (strpos($story['title'], 'Sparrow') !== false) $key = 'shy_sparrow_story';
            if (strpos($story['title'], 'Magic') !== false) $key = 'magic_chalk_story';

            $files = glob("../frontend/images/stories/{$key}_*.png");
            $finalPath = 'images/stories/default.png';
            if (!empty($files)) {
                $finalPath = 'images/stories/' . basename($files[0]);
            }

            // Append moral to content since the column doesn't exist
            $fullContent = $story['content'] . "\n\nMoral: " . $story['moral'];

            $insertStmt = $pdo->prepare("INSERT INTO stories (title, content, image_path, created_at) VALUES (?, ?, ?, NOW())");
            $insertStmt->execute([
                $story['title'],
                $fullContent,
                $finalPath
            ]);
            echo "Added story: " . $story['title'] . "\n";
        } else {
            echo "Skipped existing story: " . $story['title'] . "\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
