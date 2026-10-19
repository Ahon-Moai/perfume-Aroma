<?php
/**
 * Public Products REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    jsonError('Method not allowed', 405);
}

$id = sanitizeString($_GET['id'] ?? null);
$slug = sanitizeString($_GET['slug'] ?? null);
$category = sanitizeString($_GET['category'] ?? null);
$brand = sanitizeString($_GET['brand'] ?? null);
$gender = sanitizeString($_GET['gender'] ?? null);
$search = sanitizeString($_GET['search'] ?? null);
$featured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;

// Fetch Single Product
if ($id || $slug) {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ? AND status = 'published' LIMIT 1");
        $stmt->execute([$id]);
    } else {
        $stmt = $db->prepare("SELECT * FROM products WHERE slug = ? AND status = 'published' LIMIT 1");
        $stmt->execute([$slug]);
    }

    $product = $stmt->fetch();
    if (!$product) {
        jsonError('Product not found', 404);
    }

    // Fetch variants
    $varStmt = $db->prepare("SELECT id, size, price, cost_price, sku, stock_qty, is_available FROM product_variants WHERE product_id = ? AND is_available = 1 ORDER BY price ASC");
    $varStmt->execute([$product['id']]);
    $variants = $varStmt->fetchAll();

    $sizes = array_map(function($v) {
        return [
            'id' => $v['id'],
            'size' => $v['size'],
            'price' => (float)$v['price'],
            'stock_qty' => (int)$v['stock_qty']
        ];
    }, $variants);

    // Fetch images
    $imgStmt = $db->prepare("SELECT image_path, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
    $imgStmt->execute([$product['id']]);
    $images = $imgStmt->fetchAll();

    $notes = json_decode($product['notes'] ?? '[]', true) ?: [];
    $topNotes = json_decode($product['top_notes'] ?? '[]', true) ?: [];
    $heartNotes = json_decode($product['heart_notes'] ?? '[]', true) ?: [];
    $baseNotes = json_decode($product['base_notes'] ?? '[]', true) ?: [];
    $attributes = json_decode($product['attributes_json'] ?? '[]', true) ?: [];

    $formattedProduct = [
        'id' => $product['id'],
        'brand' => $product['brand'],
        'name' => $product['name'],
        'slug' => $product['slug'],
        'category' => $product['category'],
        'gender' => $product['gender'],
        'concentration' => $product['concentration'],
        'startingPrice' => (float)$product['starting_price'],
        'image' => $product['image'],
        'notes' => $notes,
        'topNotes' => $topNotes,
        'heartNotes' => $heartNotes,
        'baseNotes' => $baseNotes,
        'attributes' => $attributes,
        'sizes' => $sizes,
        'shortDescription' => $product['short_description'],
        'description' => $product['description'],
        'inventoryQty' => (int)$product['inventory_qty'],
        'additionalImages' => array_column($images, 'image_path')
    ];

    jsonResponse($formattedProduct, 200);
}

// Fetch List of Products
$where = ["status = 'published'"];
$params = [];

if ($category) {
    $where[] = "LOWER(category) LIKE ?";
    $params[] = '%' . strtolower($category) . '%';
}
if ($brand) {
    $where[] = "LOWER(brand) = ?";
    $params[] = strtolower($brand);
}
if ($gender) {
    $where[] = "gender = ?";
    $params[] = $gender;
}
if ($featured !== null) {
    $where[] = "is_featured = ?";
    $params[] = $featured;
}
if ($search) {
    $where[] = "(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(notes) LIKE ?)";
    $term = '%' . strtolower($search) . '%';
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

$whereClause = implode(' AND ', $where);
$sql = "SELECT * FROM products WHERE $whereClause ORDER BY is_featured DESC, created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Fetch variants for all returned products
$productIds = array_column($products, 'id');
$variantsByProduct = [];

if (!empty($productIds)) {
    $inClause = implode(',', array_fill(0, count($productIds), '?'));
    $varStmt = $db->prepare("SELECT id, product_id, size, price, stock_qty FROM product_variants WHERE product_id IN ($inClause) AND is_available = 1 ORDER BY price ASC");
    $varStmt->execute($productIds);
    $allVariants = $varStmt->fetchAll();

    foreach ($allVariants as $v) {
        $variantsByProduct[$v['product_id']][] = [
            'id' => $v['id'],
            'size' => $v['size'],
            'price' => (float)$v['price'],
            'stock_qty' => (int)$v['stock_qty']
        ];
    }
}

$formattedList = array_map(function($p) use ($variantsByProduct) {
    $notes = json_decode($p['notes'] ?? '[]', true) ?: [];
    $topNotes = json_decode($p['top_notes'] ?? '[]', true) ?: [];
    $heartNotes = json_decode($p['heart_notes'] ?? '[]', true) ?: [];
    $baseNotes = json_decode($p['base_notes'] ?? '[]', true) ?: [];
    $attributes = json_decode($p['attributes_json'] ?? '[]', true) ?: [];

    $sizes = $variantsByProduct[$p['id']] ?? [];
    if (empty($sizes)) {
        $sizes = [['size' => '5ml', 'price' => (float)$p['starting_price'], 'stock_qty' => (int)$p['inventory_qty']]];
    }

    return [
        'id' => $p['id'],
        'brand' => $p['brand'],
        'name' => $p['name'],
        'slug' => $p['slug'],
        'category' => $p['category'],
        'gender' => $p['gender'],
        'concentration' => $p['concentration'],
        'startingPrice' => (float)$p['starting_price'],
        'image' => $p['image'],
        'notes' => $notes,
        'topNotes' => $topNotes,
        'heartNotes' => $heartNotes,
        'baseNotes' => $baseNotes,
        'attributes' => $attributes,
        'sizes' => $sizes,
        'shortDescription' => $p['short_description']
    ];
}, $products);

jsonResponse($formattedList, 200);
