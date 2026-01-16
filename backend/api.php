<?php
// backend/api.php
session_start();
// Suppress warnings that break JSON (common with mail() on local XAMPP)
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

function sendEmail($to, $subject, $message) {
    if (!$to) return false;
    $headers = "From: no-reply@kidapp.com\r\n";
    $headers .= "Reply-To: no-reply@kidapp.com\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    // 1. Try sending real email (will fail on XAMPP usually)
    $sent = @mail($to, $subject, $message, $headers);

    // 2. ALWAYS save to file for local verification
    try {
        $dir = __DIR__ . '/../frontend/emails';
        if (!is_dir($dir)) mkdir($dir, 0777, true);
        
        $filename = $dir . '/email_' . date('Y-m-d_H-i-s') . '_' . preg_replace('/[^a-z0-9]/i', '', $to) . '.html';
        $localContent = "<h1>Simulated Email</h1>";
        $localContent .= "<p><b>To:</b> $to</p>";
        $localContent .= "<p><b>Subject:</b> $subject</p>";
        $localContent .= "<hr>";
        $localContent .= $message;
        
        file_put_contents($filename, $localContent);
    } catch (Exception $e) { /* ignore write errors */ }

    return true; // Always say success for the UI
}

$action = $_GET['action'] ?? '';

try {
    $pdo = getPDO();

    switch ($action) {

        /* ---------- 1. SAVE BOTH ROADMAP + GAMES ---------- */
        case 'saveProgress':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (!is_array($data)) {
                throw new RuntimeException('Invalid JSON body');
            }

            $sessionId = session_id();

            $roadmap     = isset($data['roadmap']) ? json_encode($data['roadmap']) : null;
            $games       = isset($data['games'])   ? json_encode($data['games'])   : null;
            $masterScore = 0;

            if (isset($data['games']['masterScore'])) {
                $masterScore = (int)$data['games']['masterScore'];
            } elseif (isset($data['masterScore'])) {
                $masterScore = (int)$data['masterScore'];
            }

            // upsert
            $stmt = $pdo->prepare('SELECT id FROM kidapp_state WHERE session_id = ?');
            $stmt->execute([$sessionId]);
            $row = $stmt->fetch();

            if ($row) {
                $stmt = $pdo->prepare(
                    'UPDATE kidapp_state
                     SET roadmap_json = COALESCE(?, roadmap_json),
                         games_json   = COALESCE(?, games_json),
                         master_score = ?
                     WHERE session_id = ?'
                );
                $stmt->execute([$roadmap, $games, $masterScore, $sessionId]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO kidapp_state (session_id, roadmap_json, games_json, master_score)
                     VALUES (?, ?, ?, ?)'
                );
                $stmt->execute([$sessionId, $roadmap, $games, $masterScore]);
            }

            echo json_encode([
                'ok'          => true,
                'message'     => 'Progress saved',
                'masterScore' => $masterScore
            ]);
            break;

        /* ---------- 2. LOAD EVERYTHING BACK ---------- */
        case 'loadProgress':
            $sessionId = session_id();

            $stmt = $pdo->prepare(
                'SELECT roadmap_json, games_json, master_score
                 FROM kidapp_state
                 WHERE session_id = ?'
            );
            $stmt->execute([$sessionId]);
            $row = $stmt->fetch();

            if ($row) {
                echo json_encode([
                    'ok'          => true,
                    'roadmap'     => $row['roadmap_json'] ? json_decode($row['roadmap_json'], true) : null,
                    'games'       => $row['games_json']   ? json_decode($row['games_json'], true)   : null,
                    'masterScore' => (int)$row['master_score']
                ]);
            } else {
                echo json_encode([
                    'ok'          => true,
                    'roadmap'     => null,
                    'games'       => null,
                    'masterScore' => 0
                ]);
            }
            break;

        /* ---------- 3. SAVE ONLY GAME STATS (optional) ---------- */
        case 'saveGames':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (!is_array($data)) {
                throw new RuntimeException('Invalid JSON body');
            }

            $sessionId   = session_id();
            $gamesJson   = isset($data['gameStats']) ? json_encode($data['gameStats']) : json_encode(new stdClass());
            $masterScore = isset($data['masterScore']) ? (int)$data['masterScore'] : 0;

            $stmt = $pdo->prepare('SELECT id FROM kidapp_state WHERE session_id = ?');
            $stmt->execute([$sessionId]);
            $row = $stmt->fetch();

            if ($row) {
                $stmt = $pdo->prepare(
                    'UPDATE kidapp_state
                     SET games_json = ?, master_score = ?
                     WHERE session_id = ?'
                );
                $stmt->execute([$gamesJson, $masterScore, $sessionId]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO kidapp_state (session_id, roadmap_json, games_json, master_score)
                     VALUES (?, NULL, ?, ?)'
                );
                $stmt->execute([$sessionId, $gamesJson, $masterScore]);
            }

            echo json_encode(['ok' => true, 'message' => 'Game stats saved']);
            break;

        /* ---------- 4. GET STORIES ---------- */
        case 'get_stories':
            $stmt = $pdo->query("SELECT * FROM stories ORDER BY created_at DESC");
            $stories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                'ok' => true,
                'stories' => $stories
            ]);
            break;

        /* ---------- 5. GET ANIMALS ---------- */
        case 'get_animals':
            $stmt = $pdo->query("SELECT * FROM animals ORDER BY name ASC");
            $animals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                'ok' => true,
                'animals' => $animals
            ]);
            break;

        /* ---------- 6. ADD STORY ---------- */
        case 'add_story':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Method Not Allowed');
            }

            // support both JSON (old) and FormData (new)
            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $category = $_POST['category'] ?? 'User Story';
            
            // If empty, try JSON back-fall (though FormData is preferred now)
            if (!$title && !$content) {
                $raw = file_get_contents('php://input');
                $data = json_decode($raw, true);
                $title = $data['title'] ?? '';
                $content = $data['content'] ?? '';
                $category = $data['category'] ?? 'User Story';
            }

            if (!$title || !$content) {
                throw new Exception('Title and Content are required');
            }

            $imagePath = null;
            // Handle Image Upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../frontend/uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                
                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = 'story_' . time() . '_' . rand(100,999) . '.' . $ext;
                $target = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
                    $imagePath = 'uploads/' . $filename;
                }
            }

            $stmt = $pdo->prepare("INSERT INTO stories (title, content, category, image_path) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $content, $category, $imagePath]);

            echo json_encode(['ok' => true, 'message' => 'Story added successfully']);
            break;

        /* ---------- 7. LOGIN (Get User) ---------- */
        case 'login':
            $name = $_GET['name'] ?? '';
            if (!$name) throw new Exception('Name required');
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE name = ?");
            $stmt->execute([$name]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Log login
                $pdo->prepare("INSERT INTO activity_log (user_id, activity_type, activity_name) VALUES (?, 'login', 'User Login')")->execute([$user['id']]);
                
                // Send Parent Notification
                if (!empty($user['parent_email'])) {
                    $msg = "Hi " . htmlspecialchars($user['parent_name'] ?? 'Parent') . ",<br><br>";
                    $msg .= "Just letting you know that <b>" . htmlspecialchars($user['name']) . "</b> just logged into KidApp! 🚀<br>";
                    $msg .= "Happy learning!<br><br>Best,<br>KidApp Bot 🤖";
                    sendEmail($user['parent_email'], "Login Alert: " . $user['name'], $msg);
                }

                echo json_encode(['ok' => true, 'user' => $user]);
            } else {
                echo json_encode(['ok' => false, 'error' => 'User not found. Please create an account.']);
            }
            break;

        /* ---------- 7b. REGISTER (Create User) ---------- */
        case 'register':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            $name = $data['name'] ?? ''; 
            $pName = $data['parent_name'] ?? null;
            $pEmail = $data['parent_email'] ?? null;
            
            if (!$name) throw new Exception('Name required');

            // Check if exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE name = ?");
            $stmt->execute([$name]);
            if ($stmt->fetch()) {
                echo json_encode(['ok' => false, 'error' => 'Name already exists! Try another.']);
                exit;
            }

            // Create
            $stmt = $pdo->prepare("INSERT INTO users (name, parent_name, parent_email, role, avatar) VALUES (?, ?, ?, 'kid', '🚀')");
            $stmt->execute([$name, $pName, $pEmail]);
            $id = $pdo->lastInsertId();
            $user = ['id' => $id, 'name' => $name, 'parent_name' => $pName, 'parent_email' => $pEmail, 'role' => 'kid', 'avatar' => '🚀'];
            
            // Log first login
            $pdo->prepare("INSERT INTO activity_log (user_id, activity_type, activity_name) VALUES (?, 'login', 'Account Created')")->execute([$user['id']]);

            // Welcome Email
            if ($pEmail) {
                $msg = "Welcome " . htmlspecialchars($pName ?? 'Parent') . "!<br><br>";
                $msg .= "Thanks for registering <b>" . htmlspecialchars($name) . "</b> on KidApp.<br>";
                $msg .= "We will send you weekly updates on their progress.<br><br>Best,<br>KidApp Team 🌈";
                sendEmail($pEmail, "Welcome to KidApp!", $msg);
            }

            echo json_encode(['ok' => true, 'user' => $user]);
            break;

        /* ---------- 12. GEMINI CHAT ---------- */
        case 'chat':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            $userMsg = $data['message'] ?? '';
            
            if (!$userMsg) {
                echo json_encode(['ok' => true, 'reply' => 'Please say something!']);
                exit;
            }

            // CHECK API KEY
            $hasKey = defined('GEMINI_API_KEY') && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

            if (!$hasKey) {
                 // FALLBACK MODE (Rule-based)
                 $msg = strtolower($userMsg);
                 $reply = "I'm just a simple bot right now! 🤖";
                 
                 if (strpos($msg, 'hi') !== false || strpos($msg, 'hello') !== false) {
                     $reply = "Hi there! I'm KidBot! 👋";
                 } elseif (strpos($msg, 'joke') !== false) {
                     $jokes = [
                         "Why did the teddy bear say no to dessert? Because she was stuffed!",
                         "What has ears but cannot hear? A cornfield!",
                         "Why did the student eat his homework? Because the teacher told him it was a piece of cake!"
                     ];
                     $reply = $jokes[array_rand($jokes)] . " 😂";
                 } elseif (strpos($msg, 'name') !== false) {
                     $reply = "I am KidBot, your virtual friend! 🌟";
                 } elseif (strpos($msg, 'color') !== false) {
                     $reply = "I love rainbows! 🌈 What's your favorite color?";
                 } else {
                     $reply = "That's interesting! Tell me more! Or ask for a joke! 🤖";
                 }

                 echo json_encode(['ok' => true, 'reply' => $reply]);
                 exit;
            }

            // REAL AI MODE
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . GEMINI_API_KEY;
            
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "You are a friendly, enthusiastic chatbot for a kids' app called KidApp. Answer simply, use emojis, and be encouraging. The kid says: " . $userMsg]
                        ]
                    ]
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            
            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                echo json_encode(['ok' => true, 'reply' => "Oops, my brain froze! ❄️ (Network Error)"]);
            } else {
                $json = json_decode($response, true);
                $reply = $json['candidates'][0]['content']['parts'][0]['text'] ?? "I'm not sure how to answer that! 🤔";
                echo json_encode(['ok' => true, 'reply' => $reply]);
            }
            curl_close($ch);
            break;

        /* ---------- 8. SAVE ACTIVITY ---------- */
        case 'save_activity':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            
            $uid = $data['user_id'] ?? 0;
            $type = $data['type'] ?? 'game';
            $actName = $data['name'] ?? 'Unknown';
            $score = $data['score'] ?? 0;
            $details = $data['details'] ?? '';

            if ($uid) {
                $stmt = $pdo->prepare("INSERT INTO activity_log (user_id, activity_type, activity_name, score, details) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$uid, $type, $actName, $score, $details]);
                echo json_encode(['ok' => true]);
            } else {
                echo json_encode(['ok' => false, 'error' => 'No user_id']);
            }
            break;

        /* ---------- 9. GET STATS ---------- */
        case 'get_stats':
            $uid = $_GET['user_id'] ?? 0;
            if (!$uid) throw new Exception('No user_id');

            // Granular Scores
            $stmt = $pdo->prepare("SELECT activity_type, SUM(score) as total FROM activity_log WHERE user_id = ? GROUP BY activity_type");
            $stmt->execute([$uid]);
            $breakdown = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // ['game'=>100, 'story'=>50]

            $totalScore = array_sum($breakdown);
            $gamesEx = $breakdown['game'] ?? 0;
            $storiesEx = $breakdown['story'] ?? 0;
            $learnEx = $breakdown['learn'] ?? 0;

            // Counts
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM activity_log WHERE user_id = ? AND activity_type='game'");
            $stmt->execute([$uid]);
            $gamesPlayed = $stmt->fetchColumn() ?: 0;

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM activity_log WHERE user_id = ? AND activity_type='story'");
            $stmt->execute([$uid]);
            $storiesRead = $stmt->fetchColumn() ?: 0;
            
            // Recent
            $stmt = $pdo->prepare("SELECT activity_type, activity_name, score, created_at FROM activity_log WHERE user_id = ? ORDER BY id DESC LIMIT 10");
            $stmt->execute([$uid]);
            $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'ok' => true, 
                'stats' => [
                    'total_score' => $totalScore,
                    'game_points' => (int)$gamesEx,
                    'story_points' => (int)$storiesEx,
                    'learn_points' => (int)$learnEx,
                    'games_played' => $gamesPlayed,
                    'stories_read' => $storiesRead
                ],
                'recent' => $recent
            ]);
            break;

        /* ---------- 10. GET PROFILE ---------- */
        case 'get_profile':
            $uid = $_GET['user_id'] ?? 0;
            $stmt = $pdo->prepare("SELECT id, name, parent_name, parent_email, age, fav_color, fav_animal, avatar FROM users WHERE id = ?");
            $stmt->execute([$uid]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['ok' => (bool)$u, 'profile' => $u]);
            break;

        /* ---------- 11. UPDATE PROFILE ---------- */
        case 'update_profile':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            $uid = $data['user_id'] ?? 0;
            if (!$uid) throw new Exception('No user ID');

            $age = $data['age'] ?? 6;
            $color = $data['fav_color'] ?? '#2196f3';
            $animal = $data['fav_animal'] ?? '🐶';

            $stmt = $pdo->prepare("UPDATE users SET age=?, fav_color=?, fav_animal=? WHERE id=?");
            $stmt->execute([$age, $color, $animal, $uid]);
            
            echo json_encode(['ok' => true, 'message' => 'Profile updated']);
            break;

        default:
            echo json_encode([
                'ok'      => false,
                'error'   => 'Unknown action',
                'actions' => ['get_stories', 'get_animals', 'add_story', 'login', 'save_activity', 'get_stats']
            ]);
            break;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage()
    ]);
}
