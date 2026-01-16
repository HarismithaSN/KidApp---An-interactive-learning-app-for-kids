<?php
// backend/weekly_report.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/api.php'; // to reuse sendEmail if possible, but api.php has session logic. 
// Actually api.php does side effects like session_start. Better to duplicate sendEmail or move it to a helper.
// I will just copy sendEmail here for simplicity to avoid session issues from cli.

function sendReportEmail($to, $subject, $message) {
    if (!$to) return false;
    $headers = "From: no-reply@kidapp.com\r\n";
    $headers .= "Reply-To: no-reply@kidapp.com\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    return mail($to, $subject, $message, $headers);
}

try {
    $pdo = getPDO();
    echo "Starting Weekly Report Job...<br>";

    // Get all users with emails
    $stmt = $pdo->query("SELECT * FROM users WHERE parent_email IS NOT NULL AND parent_email != ''");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($users as $user) {
        $uid = $user['id'];
        $pName = $user['parent_name'] ?? 'Parent';
        $kName = $user['name'];
        $email = $user['parent_email'];

        // Get activity for last 7 days
        $sql = "SELECT activity_type, COUNT(*) as count, SUM(score) as total_score 
                FROM activity_log 
                WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY activity_type";
        $stmtLogs = $pdo->prepare($sql);
        $stmtLogs->execute([$uid]);
        $stats = $stmtLogs->fetchAll(PDO::FETCH_ASSOC);

        if (empty($stats)) {
            echo "No activity for $kName, skipping.<br>";
            continue;
        }

        // Build Email
        $totalScore = 0;
        $details = "";
        foreach ($stats as $row) {
            $totalScore += $row['total_score'];
            $type = ucfirst($row['activity_type']);
            $details .= "<li><b>$type</b>: {$row['count']} sessions, {$row['total_score']} points</li>";
        }

        $msg = "<h2>Weekly KidApp Report 📊</h2>";
        $msg .= "<p>Hi $pName,</p>";
        $msg .= "<p>Here is how <b>$kName</b> did this week:</p>";
        $msg .= "<ul>$details</ul>";
        $msg .= "<p><b>Total New Points:</b> $totalScore ⭐</p>";
        $msg .= "<p>Keep up the great work!</p>";
        $msg .= "<small>KidApp Team</small>";

        if (sendReportEmail($email, "Weekly Report for $kName", $msg)) {
            echo "Sent email to $email ($kName).<br>";
        } else {
            echo "Failed to send to $email.<br>";
        }
    }

    echo "Job Done.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
