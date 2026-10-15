<?php
/**
 * Public Checkout & Order Confirmation REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $orderNumber = sanitizeString($_GET['order_number'] ?? null);
    if (!$orderNumber) {
        jsonError('Order number required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ? LIMIT 1");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonError('Order not found', 404);
    }

    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$order['id']]);
    $items = $itemStmt->fetchAll();

    jsonResponse([
        'order' => $order,
        'items' => $items
    ], 200);

} elseif ($method === 'POST') {
    $input = getJsonInput();

    $customerName = sanitizeString($input['customer_name'] ?? '');
    $customerPhone = sanitizeString($input['customer_phone'] ?? '');
    $customerEmail = sanitizeString($input['customer_email'] ?? '');
    $shippingAddress = sanitizeString($input['shipping_address'] ?? '');
    $cityZone = sanitizeString($input['city_zone'] ?? 'inside_dhaka'); // inside_dhaka | outside_dhaka
    $paymentMethod = sanitizeString($input['payment_method'] ?? 'cod');
    $couponCode = sanitizeString($input['coupon_code'] ?? null);
    $itemsInput = $input['items'] ?? [];

    if (empty($customerName) || empty($customerPhone) || empty($shippingAddress)) {
        jsonError('Customer name, phone number, and delivery address are required', 400);
    }

    if (empty($itemsInput) || !is_array($itemsInput)) {
        jsonError('Cart is empty', 400);
    }

    // Fetch store settings for shipping rules
    $setStmt = $db->query("SELECT setting_key, setting_value FROM store_settings");
    $settings = $setStmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

    $feeDhaka = (float)($settings['shipping_fee_dhaka'] ?? 70);
    $feeOutside = (float)($settings['shipping_fee_outside_dhaka'] ?? 130);
    $freeThreshold = (float)($settings['free_shipping_threshold'] ?? 3000);

    // SERVER-SIDE PRICE & ITEM VALIDATION
    $subtotal = 0.00;
    $validatedItems = [];

    foreach ($itemsInput as $item) {
        $productId = sanitizeString($item['product_id'] ?? $item['productId'] ?? null);
        $size = sanitizeString($item['selected_size'] ?? $item['selectedSize'] ?? null);
        $qty = (int)($item['quantity'] ?? 1);

        if (!$productId || !$size || $qty <= 0) {
            jsonError('Invalid item payload in cart', 400);
        }

        // Get product
        $pStmt = $db->prepare("SELECT id, name, brand FROM products WHERE id = ? LIMIT 1");
        $pStmt->execute([$productId]);
        $prod = $pStmt->fetch();
        if (!$prod) {
            jsonError("Product $productId not found or unavailable", 400);
        }

        // Get variant price from DB
        $vStmt = $db->prepare("SELECT id, price, stock_qty FROM product_variants WHERE product_id = ? AND size = ? LIMIT 1");
        $vStmt->execute([$productId, $size]);
        $variant = $vStmt->fetch();

        if (!$variant) {
            jsonError("Size variant $size for product {$prod['name']} not found", 400);
        }

        $unitPrice = (float)$variant['price'];
        $lineTotal = $unitPrice * $qty;
        $subtotal += $lineTotal;

        $validatedItems[] = [
            'product_id' => $prod['id'],
            'variant_id' => $variant['id'],
            'product_name' => $prod['name'],
            'brand_name' => $prod['brand'],
            'selected_size' => $size,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal
        ];
    }

    // Calculate delivery fee
    $deliveryFee = ($cityZone === 'outside_dhaka') ? $feeOutside : $feeDhaka;
    if ($subtotal >= $freeThreshold) {
        $deliveryFee = 0.00;
    }

    // Calculate coupon discount
    $discount = 0.00;
    if ($couponCode) {
        $cStmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1");
        $cStmt->execute([strtoupper($couponCode)]);
        $coupon = $cStmt->fetch();

        if ($coupon && $subtotal >= (float)$coupon['min_spend']) {
            if ($coupon['discount_type'] === 'percent') {
                $discount = round(($subtotal * (float)$coupon['discount_value']) / 100, 2);
            } else {
                $discount = (float)$coupon['discount_value'];
            }
        }
    }

    $totalAmount = max(0, ($subtotal - $discount)) + $deliveryFee;

    // DATABASE TRANSACTION
    try {
        $db->beginTransaction();

        // 1. Find or create customer
        $custStmt = $db->prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1");
        $custStmt->execute([$customerPhone]);
        $cust = $custStmt->fetch();

        if ($cust) {
            $customerId = $cust['id'];
            $upCust = $db->prepare("UPDATE customers SET name = ?, email = ?, address = ?, city_zone = ? WHERE id = ?");
            $upCust->execute([$customerName, $customerEmail, $shippingAddress, $cityZone, $customerId]);
        } else {
            $inCust = $db->prepare("INSERT INTO customers (name, email, phone, address, city_zone) VALUES (?, ?, ?, ?, ?)");
            $inCust->execute([$customerName, $customerEmail, $customerPhone, $shippingAddress, $cityZone]);
            $customerId = $db->lastInsertId();
        }

        // 2. Generate Unique Order Number
        $year = date('Y');
        $randomSuffix = strtoupper(bin2hex(random_bytes(3)));
        $orderNumber = "ORD-$year-$randomSuffix";

        // 3. Insert Order
        $ordStmt = $db->prepare("INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, shipping_address, city_zone, subtotal, discount, delivery_fee, total_amount, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending')");
        $ordStmt->execute([
            $orderNumber,
            $customerId,
            $customerName,
            $customerPhone,
            $customerEmail,
            $shippingAddress,
            $cityZone,
            $subtotal,
            $discount,
            $deliveryFee,
            $totalAmount,
            $paymentMethod
        ]);
        $orderId = $db->lastInsertId();

        // 4. Insert Order Items & Deduct Stock
        $itemIns = $db->prepare("INSERT INTO order_items (order_id, product_id, product_name, brand_name, selected_size, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stockDeductVar = $db->prepare("UPDATE product_variants SET stock_qty = MAX(0, stock_qty - ?) WHERE id = ?");
        $stockDeductProd = $db->prepare("UPDATE products SET inventory_qty = MAX(0, inventory_qty - ?) WHERE id = ?");
        $logIns = $db->prepare("INSERT INTO inventory_logs (product_id, variant_id, change_qty, previous_qty, new_qty, reason, created_by) VALUES (?, ?, ?, 0, 0, 'order_placed', 'customer')");

        foreach ($validatedItems as $vItem) {
            $itemIns->execute([
                $orderId,
                $vItem['product_id'],
                $vItem['product_name'],
                $vItem['brand_name'],
                $vItem['selected_size'],
                $vItem['quantity'],
                $vItem['unit_price'],
                $vItem['line_total']
            ]);

            // Deduct variant and main product stock
            $stockDeductVar->execute([$vItem['quantity'], $vItem['variant_id']]);
            $stockDeductProd->execute([$vItem['quantity'], $vItem['product_id']]);
            $logIns->execute([$vItem['product_id'], $vItem['variant_id'], -$vItem['quantity']]);
        }

        // 5. Status History
        $histStmt = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, NULL, 'pending', 'Order created at checkout', 'customer')");
        $histStmt->execute([$orderId]);

        $db->commit();

        jsonResponse([
            'order_number' => $orderNumber,
            'customer_name' => $customerName,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'delivery_fee' => $deliveryFee,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'status' => 'pending'
        ], 201, 'Order placed successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonError('Failed to process checkout: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
