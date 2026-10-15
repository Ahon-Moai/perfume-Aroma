<?php
/**
 * Public Settings REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();

$stmt = $db->query("SELECT setting_key, setting_value FROM store_settings");
$pairs = $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

// Filter out private keys if any exist
$publicKeys = [
    'store_name', 'tagline', 'contact_phone', 'contact_email', 'address',
    'currency', 'currency_symbol', 'shipping_fee_dhaka', 'shipping_fee_outside_dhaka',
    'free_shipping_threshold', 'enable_cod', 'enable_bkash', 'enable_nagad',
    'enable_card', 'announcement_bar'
];

$publicSettings = [];
foreach ($publicKeys as $key) {
    if (isset($pairs[$key])) {
        $publicSettings[$key] = $pairs[$key];
    }
}

jsonResponse($publicSettings, 200);
