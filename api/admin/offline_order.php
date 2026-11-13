<?php
/**
 * Admin: add an order that came in outside the website (Messenger, WhatsApp, Instagram, phone, in person).
 * The order is saved like any other order (so it shows in Orders and Analytics)
 * and the ml is taken out of the bottle immediately. Cancelling it in Orders returns the ml.
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') jsonError('Method not allowed', 405);

$db = Database::getConnection();

/** Adds orders.source once (website / messenger / whatsapp / ...). */
function ppEnsureOrderSource(PDO $db): void {
    try { $db->query("SELECT source FROM orders LIMIT 1"); return; } catch (\Throwable $e) {}
    try { $db->exec("ALTER TABLE orders ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'website'"); } catch (\Throwable $e) {}
}
ppEnsureOrderSource($db);

$in = getJsonInput();
$CHANNELS = ['messenger' => 'Messenger', 'whatsapp' => 'WhatsApp', 'instagram' => 'Instagram', 'phone' => 'Phone call', 'in_person' => 'In person'];

$name = trim(sanitizeString($in['customer_name'] ?? '') ?? '');
$phone = preg_replace('/[^\d+]/', '', (string)($in['customer_phone'] ?? ''));
$address = trim(sanitizeString($in['address'] ?? '') ?? '');
$channel = strtolower((string)($in['channel'] ?? 'messenger'));
$paid = ($in['payment_status'] ?? 'unpaid') === 'paid';
$deliveryFee = max(0, (float)($in['delivery_fee'] ?? 0));
$discount = max(0, (float)($in['discount'] ?? 0));
$note = trim(sanitizeString($in['note'] ?? '') ?? '');
$items = is_array($in['items'] ?? null) ? $in['items'] : [];

if ($name === '') jsonError('Enter the customer name', 400);
if (strlen(preg_replace('/\D/', '', $phone)) < 10) jsonError('Enter a valid phone number', 400);
if (!isset($CHANNELS[$channel])) jsonError('Choose where the order came from', 400);
if (empty($items)) jsonError('Add at least one perfume', 400);

// Resolve items and prices
$lines = [];
$subtotal = 0.0;
$pStmt = $db->prepare("SELECT id, name, brand FROM products WHERE id = ? LIMIT 1");
$vStmt = $db->prepare("SELECT id, price FROM product_variants WHERE product_id = ? AND size = ? LIMIT 1");
foreach ($items as $it) {
    $pid = sanitizeString($it['product_id'] ?? '');
    $size = sanitizeString($it['size'] ?? '');
    $qty = (int)($it['quantity'] ?? 1);
    if (!$pid || !$size || $qty < 1) jsonError('Each perfume needs a size and quantity', 400);
    $pStmt->execute([$pid]);
    $p = $pStmt->fetch();
    if (!$p) jsonError('Perfume not found', 400);
    $vStmt->execute([$pid, $size]);
    $v = $vStmt->fetch();
    $unit = isset($it['unit_price']) && $it['unit_price'] !== '' ? max(0, (float)$it['unit_price']) : (float)($v['price'] ?? 0);
    $lines[] = ['pid' => $pid, 'name' => $p['name'], 'brand' => $p['brand'], 'size' => $size, 'qty' => $qty, 'unit' => $unit, 'variant' => $v['id'] ?? null];
    $subtotal += $unit * $qty;
}
$total = max(0, $subtotal - $discount) + $deliveryFee;

try {
    $db->beginTransaction();

    // Customer: find by phone or create
    $c = $db->prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1");
    $c->execute([$phone]);
    $cid = $c->fetchColumn();
    if (!$cid) {
        $ci = $db->prepare("INSERT INTO customers (name, phone, address, city_zone) VALUES (?, ?, ?, 'inside_dhaka')");
        $ci->execute([$name, $phone, $address]);
        $cid = $db->lastInsertId();
    }

    $orderNumber = 'OFF-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
    $status = $channel === 'in_person' ? 'delivered' : 'confirmed';
    $o = $db->prepare("INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, shipping_address, city_zone, subtotal, discount, delivery_fee, total_amount, payment_method, payment_status, order_status, internal_notes, source) VALUES (?, ?, ?, ?, ?, 'inside_dhaka', ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $o->execute([
        $orderNumber, $cid, $name, $phone, $address !== '' ? $address : $CHANNELS[$channel] . ' order',
        $subtotal, $discount, $deliveryFee, $total, 'offline', $paid ? 'paid' : 'unpaid', $status,
        trim($CHANNELS[$channel] . ' order' . ($note !== '' ? ' — ' . $note : '')), $channel,
    ]);
    $orderId = (int)$db->lastInsertId();

    $ii = $db->prepare("INSERT INTO order_items (order_id, product_id, product_name, brand_name, selected_size, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($lines as $l) {
        $ii->execute([$orderId, $l['pid'], $l['name'], $l['brand'], $l['size'], $l['qty'], $l['unit'], $l['unit'] * $l['qty']]);
    }

    try {
        $res = deductInventoryForOrder($db, $orderId, $admin['username'] ?? 'admin');
    } catch (\Exception $e) {
        $db->rollBack();
        $m = $e->getMessage();
        if (preg_match('/for (.+?)\. Available: ([\d.]+)ml, Required: ([\d.]+)ml/', $m, $mm)) {
            jsonError("Only {$mm[2]}ml of {$mm[1]} left — this order needs {$mm[3]}ml", 409);
        }
        jsonError('Not enough ml left for this order', 409);
    }

    $h = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, NULL, ?, ?, ?)");
    $h->execute([$orderId, $status, 'Added by admin from ' . $CHANNELS[$channel], $admin['username'] ?? 'admin']);

    $db->commit();
    jsonResponse([
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'total_amount' => $total,
        'deducted' => $res['deducted'] ?? [],
    ], 201, 'Order added');
} catch (\Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    jsonError('Couldn’t save the order: ' . $e->getMessage(), 500);
}
