<?php
require 'db.php';

try {
    $pdo = getPDO();
    echo "Seeding more stories...<br>";

    $stories = [
        [
            'title' => 'Cinderella',
            'category' => 'Fairy Tale',
            'content' => "Once upon a time, there was a kind girl named Cinderella. She lived with her wicked stepmother and stepsisters. One day, the King invited everyone to a grand ball. Cinderella wanted to go, but she had no dress. Suddenly, a Fairy Godmother appeared! ✨ With a wave of her wand, she turned a pumpkin into a carriage and gave Cinderella a beautiful blue gown and glass slippers. 'You must be home by midnight!' said the Fairy. At the ball, the Prince fell in love with Cinderella. But the clock struck twelve! 🕛 She ran away, leaving one glass slipper behind. The Prince searched the kingdom until he found the girl whose foot fit the slipper. It was Cinderella! They married and lived happily ever after."
        ],
        [
            'title' => 'The Monkey and the Crocodile',
            'category' => 'Fable',
            'content' => "A clever monkey lived on a berry tree by a river. A crocodile lived in the river. One day, the monkey gave the crocodile some berries. They became friends. The crocodile took some berries home to his wife. She loved them but said, 'If the berries are so sweet, imagine how sweet the monkey's heart is! Bring him to me.' The crocodile tricked the monkey onto his back to cross the river. Mid-stream, he told the monkey the truth. The clever monkey said, 'Oh! I left my heart on the tree!' The foolish crocodile swam back. The monkey jumped up the tree and said, 'You can't trust everyone!' and saved his life."
        ],
        [
            'title' => 'The Thirsty Crow',
            'category' => 'Fable',
            'content' => "It was a hot summer day. A crow was very thirsty. He flew around looking for water. Finally, he saw a pot in a garden. But there was very little water at the bottom. He could not reach it. 🦅 The crow thought hard. He saw some pebbles nearby. He picked them up one by one and dropped them into the pot. Plop, plop, plop! The water level rose up. The crow drank the water and flew away happily. Moral: Where there is a will, there is a way."
        ],
        [
            'title' => 'The Lion and the Mouse',
            'category' => 'Fable',
            'content' => "A lion was sleeping in the forest. A little mouse ran over his nose and woke him up. The lion was angry and raised his paw to eat the mouse. 'Please let me go!' squeaked the mouse. 'Someday I will help you.' The lion laughed but let him go. Later, hunters caught the lion in a net. The lion roared for help. The little mouse heard him and ran to help. He chewed the ropes with his sharp teeth and set the lion free. 'You were right,' said the lion. 'Even a little friend can be a great help.'"
        ],
        [
            'title' => 'The Tortoise and the Hare',
            'category' => 'Fable',
            'content' => "The Hare boasted about how fast he could run. The Tortoise challenged him to a race. The Hare laughed, 'You? You are so slow!' The race began. The Hare ran fast and left the Tortoise far behind. 'I have plenty of time,' thought the Hare, and he took a nap under a tree. 😴 The Tortoise kept walking slowly but steadily. He passed the sleeping Hare. When the Hare woke up, he ran to the finish line, but the Tortoise was already there! Moral: Slow and steady wins the race."
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO stories (title, content, category, created_at) VALUES (?, ?, ?, NOW())");

    foreach ($stories as $s) {
        // Check if exists
        $check = $pdo->prepare("SELECT id FROM stories WHERE title = ?");
        $check->execute([$s['title']]);
        if (!$check->fetch()) {
            $stmt->execute([$s['title'], $s['content'], $s['category']]);
            echo "Added: " . $s['title'] . "<br>";
        } else {
            echo "Skipped (Exists): " . $s['title'] . "<br>";
        }
    }
    
    echo "Done seeding stories.";

} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}
