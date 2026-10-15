<?php
/**
 * Admin Coupons REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM coupons ORDER BY created_at DESC");
    jsonResponse($stmt->fetchAll(), 200);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $code = strtoupper(sanitizeString($input['code'] ?? ''));
    $discountType = sanitizeString($input['discount_type'] ?? $input['discountType'] ?? 'fixed'); // fixed | percent
    $discountValue = (float)($input['discount_value'] ?? $input['discountValue'] ?? 0.00);
    $minSpend = (float)($input['min_spend'] ?? $input['minSpend'] ?? 0.00);
    $isActive = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1;

    if (empty($code) || $discountValue <= 0) {
        jsonError('Coupon code and discount value required', 400);
    }

    try {
        $stmt = $db->prepare("INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$code, $discountType, $discountValue, $minSpend, $isActive]);

        jsonResponse(['id' => $db->lastInsertId()], 201, 'Coupon created');
    } catch (\Exception $e) {
        jsonError('Failed to create coupon: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
