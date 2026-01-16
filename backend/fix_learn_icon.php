<?php
// backend/fix_learn_icon.php
require 'config.php'; // ensure config/errors are set (optional here but good practice)

$sourcePath = __DIR__ . '/../frontend/images/learn.png';
$destPath   = __DIR__ . '/../frontend/images/learn_icon.png';

if (!file_exists($sourcePath)) {
    die("Source file not found at $sourcePath");
}

$im = imagecreatefrompng($sourcePath);
if (!$im) die("Failed to load PNG");

$width = imagesx($im);
$height = imagesy($im);

// Create transparent canvas
$imgRes = imagecreatetruecolor($width, $height);
$transparent = imagecolorallocatealpha($imgRes, 0, 0, 0, 127);
imagefill($imgRes, 0, 0, $transparent);
imagealphablending($imgRes, false);
imagesavealpha($imgRes, true);

$whiteThreshold = 230; // Slightly aggressive to catch off-whites

for ($x = 0; $x < $width; $x++) {
    for ($y = 0; $y < $height; $y++) {
        $rgb = imagecolorat($im, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        $alpha = ($rgb >> 24) & 0x7F;

        // If pixel is near white, make it transparent
        if ($r >= $whiteThreshold && $g >= $whiteThreshold && $b >= $whiteThreshold) {
            imagesetpixel($imgRes, $x, $y, $transparent);
        } else {
            // Copy pixel
            $color = imagecolorallocatealpha($imgRes, $r, $g, $b, $alpha);
            imagesetpixel($imgRes, $x, $y, $color);
        }
    }
}

// Save
imagepng($imgRes, $destPath);
imagedestroy($im);
imagedestroy($imgRes);

echo "Created transparent icon at $destPath";
?>
