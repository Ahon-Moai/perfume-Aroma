<?php
/**
 * Admin Product CRUD REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            jsonError('Product not found', 404);
        }

        $vStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY price ASC");
        $vStmt->execute([$id]);
        $variants = $vStmt->fetchAll();

        $imgStmt = $db->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $imgStmt->execute([$id]);
        $images = $imgStmt->fetchAll();

        $product['variants'] = $variants;
        $product['images'] = array_map(function($i) { return $i['image_path']; }, $images);
        $product['additional_images'] = array_map(function($i) { return $i['image_path']; }, $images);
        $product['gallery_images'] = $images;
        $product['notes'] = json_decode($product['notes'] ?? '[]', true) ?: [];
        $product['top_notes'] = json_decode($product['top_notes'] ?? '[]', true) ?: [];
        $product['heart_notes'] = json_decode($product['heart_notes'] ?? '[]', true) ?: [];
        $product['base_notes'] = json_decode($product['base_notes'] ?? '[]', true) ?: [];
        $product['attributes'] = json_decode($product['attributes_json'] ?? '[]', true) ?: [];

        jsonResponse($product, 200);
    } else {
        $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();

        foreach ($products as &$p) {
            $vStmt = $db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
            $vStmt->execute([$p['id']]);
            $p['variants'] = $vStmt->fetchAll();

            $imgStmt = $db->prepare("SELECT image_path FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
            $imgStmt->execute([$p['id']]);
            $imgRows = $imgStmt->fetchAll();
            $p['additional_images'] = array_column($imgRows, 'image_path');
            $p['images'] = array_column($imgRows, 'image_path');

            $p['notes'] = json_decode($p['notes'] ?? '[]', true) ?: [];
            $p['top_notes'] = json_decode($p['top_notes'] ?? '[]', true) ?: [];
            $p['heart_notes'] = json_decode($p['heart_notes'] ?? '[]', true) ?: [];
            $p['base_notes'] = json_decode($p['base_notes'] ?? '[]', true) ?: [];
            $p['attributes'] = json_decode($p['attributes_json'] ?? '[]', true) ?: [];
        }

        jsonResponse($products, 200);
    }

} elseif ($method === 'POST') {
    // Create product
    $input = getJsonInput();

    $id = sanitizeString($input['id'] ?? ('prod-' . bin2hex(random_bytes(4))));
    $brand = sanitizeString($input['brand'] ?? 'ARRINA');
    $name = sanitizeString($input['name'] ?? '');
    $slug = sanitizeString($input['slug'] ?? slugify($name));
    $category = sanitizeString($input['category'] ?? 'Unisex');
    $gender = sanitizeString($input['gender'] ?? 'Unisex');
    $concentration = sanitizeString($input['concentration'] ?? 'Eau de Parfum');
    $startingPrice = (float)($input['starting_price'] ?? $input['startingPrice'] ?? 0.00);
    $costPrice = (float)($input['cost_price'] ?? 0.00);
    $shortDescription = sanitizeString($input['short_description'] ?? $input['shortDescription'] ?? '');
    $description = sanitizeString($input['description'] ?? '');
    $image = sanitizeString($input['image'] ?? '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg');
    $notes = is_array($input['notes'] ?? null) ? json_encode($input['notes']) : json_encode([]);
    $topNotes = is_array($input['top_notes'] ?? $input['topNotes'] ?? null) ? json_encode($input['top_notes'] ?? $input['topNotes']) : json_encode([]);
    $heartNotes = is_array($input['heart_notes'] ?? $input['heartNotes'] ?? null) ? json_encode($input['heart_notes'] ?? $input['heartNotes']) : json_encode([]);
    $baseNotes = is_array($input['base_notes'] ?? $input['baseNotes'] ?? null) ? json_encode($input['base_notes'] ?? $input['baseNotes']) : json_encode([]);
    $attributesJson = is_array($input['attributes'] ?? $input['attributes_json'] ?? null) ? json_encode($input['attributes'] ?? $input['attributes_json']) : json_encode([]);
    $status = sanitizeString($input['status'] ?? 'published');
    $inventoryQty = (int)($input['inventory_qty'] ?? $input['inventoryQty'] ?? 100);
    $isFeatured = !empty($input['is_featured']) ? 1 : 0;
    $isNewArrival = !empty($input['is_new_arrival']) ? 1 : 0;

    if (empty($name)) {
        jsonError('Product name is required', 400);
    }

    try {
        $db->beginTransaction();

        $stmt = $db->prepare("INSERT INTO products (id, brand, name, slug, category, gender, concentration, starting_price, cost_price, short_description, description, image, notes, top_notes, heart_notes, base_notes, attributes_json, status, inventory_qty, is_featured, is_new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id, $brand, $name, $slug, $category, $gender, $concentration,
            $startingPrice, $costPrice, $shortDescription, $description,
            $image, $notes, $topNotes, $heartNotes, $baseNotes, $attributesJson, $status, $inventoryQty, $isFeatured, $isNewArrival
        ]);

        // Variants
        $variants = $input['variants'] ?? $input['sizes'] ?? [];
        if (!empty($variants) && is_array($variants)) {
            $vStmt = $db->prepare("INSERT INTO product_variants (id, product_id, size, price, cost_price, sku, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($variants as $idx => $v) {
                $vSize = sanitizeString($v['size'] ?? '5ml');
                $vPrice = (float)($v['price'] ?? $startingPrice);
                $vCost = (float)($v['cost_price'] ?? 0.00);
                $vSku = sanitizeString($v['sku'] ?? ($id . '-' . $vSize));
                $vStock = (int)($v['stock_qty'] ?? $inventoryQty);
                $varId = $id . '-var-' . ($idx + 1);

                $vStmt->execute([$varId, $id, $vSize, $vPrice, $vCost, $vSku, $vStock]);
            }
        }

        // Additional Gallery Images
        $additionalImages = $input['additional_images'] ?? $input['additionalImages'] ?? $input['images'] ?? [];
        if (!empty($additionalImages) && is_array($additionalImages)) {
            $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_path, display_order, is_primary) VALUES (?, ?, ?, 0)");
            foreach ($additionalImages as $order => $imgPath) {
                if (is_string($imgPath) && !empty(trim($imgPath))) {
                    $imgStmt->execute([$id, trim($imgPath), $order + 1]);
                }
            }
        }

        // Audit Log
        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'create_product', 'products', ?, ?)");
        $logStmt->execute([$admin['id'], $id, "Created product: $name"]);

        $db->commit();
        jsonResponse(['id' => $id], 201, 'Product created successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to create product: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    // Update product
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);

    if (!$id) {
        jsonError('Product ID required for update', 400);
    }

    $brand = sanitizeString($input['brand'] ?? 'ARRINA');
    $name = sanitizeString($input['name'] ?? '');
    $slug = sanitizeString($input['slug'] ?? slugify($name));
    $category = sanitizeString($input['category'] ?? 'Unisex');
    $gender = sanitizeString($input['gender'] ?? 'Unisex');
    $concentration = sanitizeString($input['concentration'] ?? 'Eau de Parfum');
    $startingPrice = (float)($input['starting_price'] ?? $input['startingPrice'] ?? 0.00);
    $costPrice = (float)($input['cost_price'] ?? 0.00);
    $shortDescription = sanitizeString($input['short_description'] ?? $input['shortDescription'] ?? '');
    $description = sanitizeString($input['description'] ?? '');
    $image = sanitizeString($input['image'] ?? '');
    $notes = is_array($input['notes'] ?? null) ? json_encode($input['notes']) : json_encode([]);
    $topNotes = is_array($input['top_notes'] ?? $input['topNotes'] ?? null) ? json_encode($input['top_notes'] ?? $input['topNotes']) : json_encode([]);
    $heartNotes = is_array($input['heart_notes'] ?? $input['heartNotes'] ?? null) ? json_encode($input['heart_notes'] ?? $input['heartNotes']) : json_encode([]);
    $baseNotes = is_array($input['base_notes'] ?? $input['baseNotes'] ?? null) ? json_encode($input['base_notes'] ?? $input['baseNotes']) : json_encode([]);
    $attributesJson = is_array($input['attributes'] ?? $input['attributes_json'] ?? null) ? json_encode($input['attributes'] ?? $input['attributes_json']) : json_encode([]);
    $status = sanitizeString($input['status'] ?? 'published');
    $inventoryQty = (int)($input['inventory_qty'] ?? $input['inventoryQty'] ?? 100);
    $isFeatured = !empty($input['is_featured']) ? 1 : 0;
    $isNewArrival = !empty($input['is_new_arrival']) ? 1 : 0;

    try {
        $db->beginTransaction();

        $stmt = $db->prepare("UPDATE products SET brand = ?, name = ?, slug = ?, category = ?, gender = ?, concentration = ?, starting_price = ?, cost_price = ?, short_description = ?, description = ?, image = IF(?, ?, image), notes = ?, status = ?, inventory_qty = ?, is_featured = ?, is_new_arrival = ? WHERE id = ?");
        // Portable handling for optional image update
        $db->exec("UPDATE products SET brand = " . $db->quote($brand) . ", name = " . $db->quote($name) . ", slug = " . $db->quote($slug) . ", category = " . $db->quote($category) . ", gender = " . $db->quote($gender) . ", concentration = " . $db->quote($concentration) . ", starting_price = $startingPrice, cost_price = $costPrice, short_description = " . $db->quote($shortDescription) . ", description = " . $db->quote($description) . ($image ? ", image = " . $db->quote($image) : "") . ", notes = " . $db->quote($notes) . ", top_notes = " . $db->quote($topNotes) . ", heart_notes = " . $db->quote($heartNotes) . ", base_notes = " . $db->quote($baseNotes) . ", attributes_json = " . $db->quote($attributesJson) . ", status = " . $db->quote($status) . ", inventory_qty = $inventoryQty, is_featured = $isFeatured, is_new_arrival = $isNewArrival WHERE id = " . $db->quote($id));

        // Sync Variants
        $variants = $input['variants'] ?? $input['sizes'] ?? [];
        if (!empty($variants) && is_array($variants)) {
            $db->exec("DELETE FROM product_variants WHERE product_id = " . $db->quote($id));
            $vStmt = $db->prepare("INSERT INTO product_variants (id, product_id, size, price, cost_price, sku, stock_qty) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($variants as $idx => $v) {
                $vSize = sanitizeString($v['size'] ?? '5ml');
                $vPrice = (float)($v['price'] ?? $startingPrice);
                $vCost = (float)($v['cost_price'] ?? 0.00);
                $vSku = sanitizeString($v['sku'] ?? ($id . '-' . $vSize));
                $vStock = (int)($v['stock_qty'] ?? $inventoryQty);
                $varId = $id . '-var-' . ($idx + 1);

                $vStmt->execute([$varId, $id, $vSize, $vPrice, $vCost, $vSku, $vStock]);
            }
        }

        // Sync Gallery Images
        $additionalImages = $input['additional_images'] ?? $input['additionalImages'] ?? $input['images'] ?? null;
        if ($additionalImages !== null && is_array($additionalImages)) {
            $db->exec("DELETE FROM product_images WHERE product_id = " . $db->quote($id));
            $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_path, display_order, is_primary) VALUES (?, ?, ?, 0)");
            foreach ($additionalImages as $order => $imgPath) {
                if (is_string($imgPath) && !empty(trim($imgPath))) {
                    $imgStmt->execute([$id, trim($imgPath), $order + 1]);
                }
            }
        }

        // Audit Log
        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'update_product', 'products', ?, ?)");
        $logStmt->execute([$admin['id'], $id, "Updated product: $name"]);

        $db->commit();
        jsonResponse(null, 200, 'Product updated successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to update product: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'DELETE') {
    $id = sanitizeString($_GET['id'] ?? null);
    if (!$id) {
        jsonError('Product ID required', 400);
    }

    $stmt = $db->prepare("UPDATE products SET status = 'archived' WHERE id = ?");
    $stmt->execute([$id]);

    $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'archive_product', 'products', ?, ?)");
    $logStmt->execute([$admin['id'], $id, "Archived product ID: $id"]);

    jsonResponse(null, 200, 'Product archived');
} else {
    jsonError('Method not allowed', 405);
}
