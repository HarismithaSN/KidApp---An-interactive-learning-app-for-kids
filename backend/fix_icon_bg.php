<?php
// backend/fix_icon_bg.php
// Usage: php fix_icon_bg.php [source_file] [dest_file]
require 'config.php';

$sourceArg = $argv[1] ?? '';
$destArg   = $argv[2] ?? '';

if (!$sourceArg || !$destArg) {
    die("Usage: php fix_icon_bg.php [source_file] [dest_file]\n");
}

$sourcePath = __DIR__ . '/../frontend/images/' . $sourceArg;
$destPath   = __DIR__ . '/../frontend/images/' . $destArg;

if (!file_exists($sourcePath)) {
    die("Source file not found at $sourcePath\n");
}

$im = imagecreatefrompng($sourcePath);
if (!$im) die("Failed to load PNG: $sourcePath\n");

$width = imagesx($im);
$height = imagesy($im);

// Create transparent canvas
$imgRes = imagecreatetruecolor($width, $height);
$transparent = imagecolorallocatealpha($imgRes, 0, 0, 0, 127);
imagefill($imgRes, 0, 0, $transparent);
imagealphablending($imgRes, false);
imagesavealpha($imgRes, true);

$whiteThreshold = 230;

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

echo "Created transparent icon: $destArg\n";
?>
