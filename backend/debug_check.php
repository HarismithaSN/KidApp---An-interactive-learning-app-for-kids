<?php
// backend/debug_register.php

// Mock $_GET and input stream
$_GET['action'] = 'register';
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock input
$inputTypes = [
    ['name' => 'TestKid_' . rand(100,999), 'parent_name' => 'TestParent', 'parent_email' => 'test@example.com']
];

// We need to capture the output of api.php
// But api.php reads php://input which we can't easily mock for include.
// Instead, let's just make a CURL request to the local server if possible, OR
// Set up modifying api.php to read from a variable if testing.

// Simpler approach: Just copy the logic of register from api.php and run it here to see if it errors.
// But that won't show us "echo" side effects from the file inclusion itself.

// Best approach: Use valid CLI testing of the file.
// We can use the php-cgi executable if available to treat it like a web request, but we might not have it.
// Let's try to include it but override file_get_contents wrapper? No, too complex.

// Let's just try to run api.php and see if it outputs anything weird BEFORE the json.
// We will define a wrapper that populates $_GET and then includes api.php.
// To handle file_get_contents('php://input'), we can't easily do that with include.
// So we will modify api.php slightly to support test input or just debug by manual review.

// Actually, let's try to verify if mail() is the culprit by temporarily disabling it in api.php too.
// But first, let's checking the file content for whitespace.

$files = ['c:/xampp/htdocs/kidapp/backend/api.php', 'c:/xampp/htdocs/kidapp/backend/config.php'];

foreach ($files as $f) {
    echo "Checking $f ...\n";
    $content = file_get_contents($f);
    if (substr($content, 0, 5) !== '<?php') {
        echo "WARNING: File does not start with <?php exactly.\n";
        echo "First 10 chars hex: " . bin2hex(substr($content, 0, 10)) . "\n";
    }
    // Check for closing ?> whitespace
    if (substr(trim($content), -2) === '?>') {
       echo "File ends with checkout closing tag. This is okay but risky if whitespace follows.\n";
    }
}

echo "Done checking files.\n";
?>
