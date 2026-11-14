<?php
/**
 * Lightweight image resizer for product photos.
 * GET /api/img.php?src=/uploads/abc.png&w=480
 * Resizes once, caches the result under /uploads/_thumbs/{w}/, then serves the cached file.
 * Falls back to the original file if GD is unavailable or anything fails.
 */

$src = (string)($_GET['src'] ?? '');
$w = (int)($_GET['w'] ?? 480);
$allowedW = [160, 320, 480, 720];
if (!in_array($w, $allowedW, true)) $w = 480;

if (!preg_match('#^/uploads/([A-Za-z0-9_\-]+)\.(png|jpe?g|webp)$#', $src, $m)) {
    http_response_code(400);
    exit('Bad image');
}

$root = dirname(__DIR__);
$orig = $root . $src;
if (!is_file($orig)) {
    http_response_code(404);
    exit('Not found');
}

$serve = function (string $file, string $type) {
    header('Content-Type: ' . $type);
    header('Cache-Control: public, max-age=31536000, immutable');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
};
$origType = ['png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp'][strtolower($m[2])];

$canWebp = function_exists('imagewebp') && function_exists('imagecreatefromstring');
if (!$canWebp) $serve($orig, $origType);

$dir = $root . '/uploads/_thumbs/' . $w;
$out = $dir . '/' . $m[1] . '.webp';
if (is_file($out) && filemtime($out) >= filemtime($orig)) $serve($out, 'image/webp');

try {
    $data = file_get_contents($orig);
    $im = @imagecreatefromstring($data);
    if (!$im) $serve($orig, $origType);
    $ow = imagesx($im);
    $oh = imagesy($im);
    if ($ow <= $w) { imagedestroy($im); $serve($orig, $origType); }
    $nh = (int)round($oh * $w / $ow);
    $dst = imagecreatetruecolor($w, $nh);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 0, 0, 0, 127));
    imagecopyresampled($dst, $im, 0, 0, 0, 0, $w, $nh, $ow, $oh);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $tmp = $out . '.' . getmypid() . '.tmp';
    if (@imagewebp($dst, $tmp, 80) && @rename($tmp, $out)) {
        imagedestroy($im);
        imagedestroy($dst);
        $serve($out, 'image/webp');
    }
    @unlink($tmp);
    // Could not write the cache: stream the resized image directly
    header('Content-Type: image/webp');
    header('Cache-Control: public, max-age=86400');
    imagewebp($dst, null, 80);
    imagedestroy($im);
    imagedestroy($dst);
    exit;
} catch (Throwable $e) {
    $serve($orig, $origType);
}
