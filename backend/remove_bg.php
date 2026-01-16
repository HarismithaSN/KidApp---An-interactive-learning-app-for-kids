<?php
// backend/remove_bg.php

$sourcePath = __DIR__ . '/../frontend/images/animals_icon.png';
$destPath = __DIR__ . '/../frontend/images/animals_icon_clean.png';

if (!file_exists($sourcePath)) {
    die("Source file not found at $sourcePath. Current dir: " . getcwd() . "\n");
}

$info = getimagesize($sourcePath);
$mime = $info['mime'];

switch ($mime) {
    case 'image/jpeg': $im = imagecreatefromjpeg($sourcePath); break;
    case 'image/png':  $im = imagecreatefrompng($sourcePath); break;
    case 'image/gif':  $im = imagecreatefromgif($sourcePath); break;
    default: die("Unsupported format: $mime\n");
}

$width = imagesx($im);
$height = imagesy($im);

// 1. Create a transparent canvas
$imgRes = imagecreatetruecolor($width, $height);
$transparent = imagecolorallocatealpha($imgRes, 0, 0, 0, 127);
imagefill($imgRes, 0, 0, $transparent);
imagealphablending($imgRes, false);
imagesavealpha($imgRes, true);

// 2. Remove white background (approximate)
$whiteThreshold = 240; // 0-255

for ($x = 0; $x < $width; $x++) {
    for ($y = 0; $y < $height; $y++) {
        $rgb = imagecolorat($im, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;

        // Check if near white
        if ($r >= $whiteThreshold && $g >= $whiteThreshold && $b >= $whiteThreshold) {
            // Make transparent
            imagesetpixel($imgRes, $x, $y, $transparent);
        } else {
            // Keep pixel, handle alpha if existing
             $alpha = ($rgb >> 24) & 0x7F;
             $color = imagecolorallocatealpha($imgRes, $r, $g, $b, $alpha);
             imagesetpixel($imgRes, $x, $y, $color);
        }
    }
}

// 3. Crop to square (center)
$sStr = min($width, $height);
$xOff = ($width - $sStr) / 2;
$yOff = ($height - $sStr) / 2;

$cropped = imagecreatetruecolor($sStr, $sStr);
imagefill($cropped, 0, 0, $transparent);
imagealphablending($cropped, false);
imagesavealpha($cropped, true);

imagecopy($cropped, $imgRes, 0, 0, $xOff, $yOff, $sStr, $sStr);

// Save
imagepng($cropped, $destPath);
imagedestroy($im);
imagedestroy($imgRes);
imagedestroy($cropped);

echo "Created clean icon at $destPath\n";
?>
