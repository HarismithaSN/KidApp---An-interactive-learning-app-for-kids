<?php
// backend/auth.php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

function json_response($data, int $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

try {
    $pdo = getPDO();

    // Read JSON body from fetch()
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    $action = $data['action'] ?? '';

    switch ($action) {

        /* ---------- REGISTER ---------- */
        case 'register':
            $parentName = trim($data['parentName'] ?? '');
            $childName  = trim($data['childName'] ?? '');
            $email      = trim($data['email'] ?? '');
            $password   = $data['password'] ?? '';
            $avatar     = $data['avatar'] ?? '🌈';

            if ($parentName === '' || $childName === '' || $email === '' || $password === '') {
                json_response(['ok' => false, 'error' => 'Please fill in all fields.'], 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                json_response(['ok' => false, 'error' => 'Please enter a valid email.'], 400);
            }

            // Check if email exists
            $stmt = $pdo->prepare('SELECT id FROM kidapp_users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                json_response(['ok' => false, 'error' => 'This email is already registered.'], 400);
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare(
                'INSERT INTO kidapp_users (parent_name, child_name, email, password_hash, avatar_emoji)
                 VALUES (?, ?, ?, ?, ?)'
            );
            $stmt->execute([$parentName, $childName, $email, $hash, $avatar]);

            $userId = (int)$pdo->lastInsertId();
            $_SESSION['user_id']     = $userId;
            $_SESSION['child_name']  = $childName;
            $_SESSION['avatar']      = $avatar;

            json_response([
                'ok'   => true,
                'user' => [
                    'id'         => $userId,
                    'parentName' => $parentName,
                    'childName'  => $childName,
                    'email'      => $email,
                    'avatar'     => $avatar
                ]
            ]);
            break;

        /* ---------- LOGIN ---------- */
        case 'login':
            $email    = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';

            if ($email === '' || $password === '') {
                json_response(['ok' => false, 'error' => 'Please enter email and password.'], 400);
            }

            $stmt = $pdo->prepare(
                'SELECT id, parent_name, child_name, email, password_hash, avatar_emoji
                 FROM kidapp_users
                 WHERE email = ?'
            );
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                json_response(['ok' => false, 'error' => 'Email or password is incorrect.'], 401);
            }

            $_SESSION['user_id']    = (int)$user['id'];
            $_SESSION['child_name'] = $user['child_name'];
            $_SESSION['avatar']     = $user['avatar_emoji'];

            json_response([
                'ok'   => true,
                'user' => [
                    'id'         => (int)$user['id'],
                    'parentName' => $user['parent_name'],
                    'childName'  => $user['child_name'],
                    'email'      => $user['email'],
                    'avatar'     => $user['avatar_emoji']
                ]
            ]);
            break;

        /* ---------- LOGOUT ---------- */
        case 'logout':
            $_SESSION = [];
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            session_destroy();
            json_response(['ok' => true, 'message' => 'Logged out']);
            break;

        /* ---------- GET CURRENT USER ---------- */
        case 'me':
            if (!isset($_SESSION['user_id'])) {
                json_response(['ok' => false, 'user' => null]);
            }
            json_response([
                'ok'   => true,
                'user' => [
                    'id'        => (int)$_SESSION['user_id'],
                    'childName' => $_SESSION['child_name'] ?? '',
                    'avatar'    => $_SESSION['avatar'] ?? '🌈'
                ]
            ]);
            break;

        default:
            json_response([
                'ok'      => false,
                'error'   => 'Unknown action',
                'actions' => ['register', 'login', 'logout', 'me']
            ], 400);
    }

} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 500);
}
