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
    $additionalImages = array_column($images, 'image_path');
    $allImages = array_values(array_unique(array_filter(array_merge([$product['image']], $additionalImages))));

    $notes = json_decode($product['notes'] ?? '[]', true) ?: [];
    $topNotes = json_decode($product['top_notes'] ?? '[]', true) ?: [];
    $heartNotes = json_decode($product['heart_notes'] ?? '[]', true) ?: [];
    $baseNotes = json_decode($product['base_notes'] ?? '[]', true) ?: [];
    $attributes = json_decode($product['attributes_json'] ?? '[]', true) ?: [];
    $scentProfile = json_decode($product['scent_profile_json'] ?? '{}', true) ?: new \stdClass();

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
        'images' => $allImages,
        'additionalImages' => $additionalImages,
        'notes' => $notes,
        'topNotes' => $topNotes,
        'heartNotes' => $heartNotes,
        'baseNotes' => $baseNotes,
        'attributes' => $attributes,
        'scentProfile' => $scentProfile,
        'scent_profile' => $scentProfile,
        'sizes' => $sizes,
        'shortDescription' => $product['short_description'],
        'description' => $product['description'],
        'inventoryQty' => (int)$product['inventory_qty']
    ];

    jsonResponse($formattedProduct, 200);
}

// Fetch List of Products
$where = ["status = 'published'"];
$params = [];

$collection = sanitizeString($_GET['collection'] ?? $_GET['collection_slug'] ?? null);
$family = sanitizeString($_GET['family'] ?? null);
$season = sanitizeString($_GET['season'] ?? null);
$occasion = sanitizeString($_GET['occasion'] ?? null);
$size = sanitizeString($_GET['size'] ?? null);
$concentration = sanitizeString($_GET['concentration'] ?? null);
$minPrice = isset($_GET['min_price']) && $_GET['min_price'] !== '' ? (float)$_GET['min_price'] : null;
$maxPrice = isset($_GET['max_price']) && $_GET['max_price'] !== '' ? (float)$_GET['max_price'] : null;
$newArrival = isset($_GET['new_arrival']) ? (int)$_GET['new_arrival'] : null;
$sort = sanitizeString($_GET['sort'] ?? 'featured');

// Collection Rule Handling
if ($collection && $collection !== 'all') {
    $cleanCol = strtolower(trim($collection));
    if (in_array($cleanCol, ['forhim', 'for-him', 'him', 'men'])) {
        $where[] = "gender = 'Him'";
    } elseif (in_array($cleanCol, ['forher', 'for-her', 'her', 'women'])) {
        $where[] = "gender = 'Her'";
    } elseif (in_array($cleanCol, ['unisex', 'shared'])) {
        $where[] = "gender = 'Unisex'";
    } elseif (in_array($cleanCol, ['best-sellers', 'bestsellers', 'best-seller', 'popular'])) {
        $where[] = "is_featured = 1";
    } elseif (in_array($cleanCol, ['new-arrivals', 'newarrivals', 'new-arrival', 'new'])) {
        $where[] = "is_new_arrival = 1";
    } else {
        // Query database collections table rule
        $colStmt = $db->prepare("SELECT * FROM collections WHERE (slug = ? OR LOWER(title) = ?) AND is_enabled = 1 LIMIT 1");
        $colStmt->execute([$cleanCol, str_replace('-', ' ', $cleanCol)]);
        $colRow = $colStmt->fetch();

        if ($colRow) {
            if ($colRow['rule_type'] === 'gender' && !empty($colRow['rule_value'])) {
                $where[] = "gender = ?";
                $params[] = $colRow['rule_value'];
            } elseif ($colRow['rule_type'] === 'category' && !empty($colRow['rule_value'])) {
                $where[] = "(LOWER(category) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
                $params[] = '%' . strtolower($colRow['rule_value']) . '%';
                $params[] = '%' . strtolower($colRow['rule_value']) . '%';
            } elseif ($colRow['rule_type'] === 'featured') {
                $where[] = "is_featured = 1";
            } elseif ($colRow['rule_type'] === 'new_arrival') {
                $where[] = "is_new_arrival = 1";
            } elseif ($colRow['rule_type'] === 'manual') {
                $mapStmt = $db->prepare("SELECT product_id FROM collection_products WHERE collection_id = ?");
                $mapStmt->execute([$colRow['id']]);
                $mappedIds = array_column($mapStmt->fetchAll(), 'product_id');
                if (!empty($mappedIds)) {
                    $inM = implode(',', array_fill(0, count($mappedIds), '?'));
                    $where[] = "id IN ($inM)";
                    foreach ($mappedIds as $mId) $params[] = $mId;
                } else {
                    $where[] = "1 = 0";
                }
            }
        } else {
            // General category fallback
            $where[] = "(LOWER(category) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
            $params[] = '%' . str_replace('-', ' ', $cleanCol) . '%';
            $params[] = '%' . str_replace('-', ' ', $cleanCol) . '%';
        }
    }
}

if ($category) {
    $where[] = "(LOWER(category) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
    $params[] = '%' . strtolower($category) . '%';
    $params[] = '%' . strtolower($category) . '%';
}

if ($family) {
    $families = explode(',', $family);
    $familyClauses = [];
    foreach ($families as $f) {
        if (!empty(trim($f))) {
            $familyClauses[] = "(LOWER(category) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
            $params[] = '%' . strtolower(trim($f)) . '%';
            $params[] = '%' . strtolower(trim($f)) . '%';
        }
    }
    if (!empty($familyClauses)) {
        $where[] = '(' . implode(' OR ', $familyClauses) . ')';
    }
}

if ($brand) {
    $brands = explode(',', $brand);
    $brandClauses = [];
    foreach ($brands as $b) {
        if (!empty(trim($b))) {
            $brandClauses[] = "LOWER(brand) = ?";
            $params[] = strtolower(trim($b));
        }
    }
    if (!empty($brandClauses)) {
        $where[] = '(' . implode(' OR ', $brandClauses) . ')';
    }
}

if ($gender) {
    $genders = explode(',', $gender);
    $genderClauses = [];
    foreach ($genders as $g) {
        if (!empty(trim($g))) {
            $genderClauses[] = "LOWER(gender) = ? OR LOWER(scent_profile_json) LIKE ?";
            $params[] = strtolower(trim($g));
            $params[] = '%' . strtolower(trim($g)) . '%';
        }
    }
    if (!empty($genderClauses)) {
        $where[] = '(' . implode(' OR ', $genderClauses) . ')';
    }
}

if ($season) {
    $seasons = explode(',', $season);
    $seasonClauses = [];
    foreach ($seasons as $s) {
        if (!empty(trim($s))) {
            $seasonClauses[] = "LOWER(scent_profile_json) LIKE ?";
            $params[] = '%' . strtolower(trim($s)) . '%';
        }
    }
    if (!empty($seasonClauses)) {
        $where[] = '(' . implode(' OR ', $seasonClauses) . ')';
    }
}

if ($occasion) {
    $occasions = explode(',', $occasion);
    $occClauses = [];
    foreach ($occasions as $o) {
        if (!empty(trim($o))) {
            $occClauses[] = "LOWER(scent_profile_json) LIKE ?";
            $params[] = '%' . strtolower(trim($o)) . '%';
        }
    }
    if (!empty($occClauses)) {
        $where[] = '(' . implode(' OR ', $occClauses) . ')';
    }
}

if ($concentration) {
    $where[] = "(LOWER(concentration) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
    $params[] = '%' . strtolower($concentration) . '%';
    $params[] = '%' . strtolower($concentration) . '%';
}

if ($minPrice !== null) {
    $where[] = "starting_price >= ?";
    $params[] = $minPrice;
}

if ($maxPrice !== null) {
    $where[] = "starting_price <= ?";
    $params[] = $maxPrice;
}

if ($featured !== null) {
    $where[] = "is_featured = ?";
    $params[] = $featured;
}

if ($newArrival !== null) {
    $where[] = "is_new_arrival = ?";
    $params[] = $newArrival;
}

if ($search) {
    $where[] = "(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(notes) LIKE ? OR LOWER(scent_profile_json) LIKE ?)";
    $term = '%' . strtolower($search) . '%';
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

// Sorting logic
$orderBy = "is_featured DESC, created_at DESC";
switch (strtolower($sort)) {
    case 'price-asc':
    case 'price_low_high':
    case 'price_asc':
        $orderBy = "starting_price ASC, name ASC";
        break;
    case 'price-desc':
    case 'price_high_low':
    case 'price_desc':
        $orderBy = "starting_price DESC, name ASC";
        break;
    case 'newest':
    case 'new':
        $orderBy = "created_at DESC";
        break;
    case 'name-asc':
    case 'a_z':
    case 'title':
        $orderBy = "name ASC";
        break;
    case 'best-selling':
    case 'bestselling':
        $orderBy = "is_featured DESC, starting_price DESC";
        break;
    case 'featured':
    default:
        $orderBy = "is_featured DESC, created_at DESC";
        break;
}

$whereClause = implode(' AND ', $where);
$sql = "SELECT * FROM products WHERE $whereClause ORDER BY $orderBy";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Fetch variants and images for all returned products
$productIds = array_column($products, 'id');
$variantsByProduct = [];
$imagesByProduct = [];

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

    $imgStmt = $db->prepare("SELECT product_id, image_path FROM product_images WHERE product_id IN ($inClause) ORDER BY display_order ASC");
    $imgStmt->execute($productIds);
    $allImages = $imgStmt->fetchAll();

    foreach ($allImages as $img) {
        $imagesByProduct[$img['product_id']][] = $img['image_path'];
    }
}

$formattedList = array_map(function($p) use ($variantsByProduct, $imagesByProduct) {
    $notes = json_decode($p['notes'] ?? '[]', true) ?: [];
    $topNotes = json_decode($p['top_notes'] ?? '[]', true) ?: [];
    $heartNotes = json_decode($p['heart_notes'] ?? '[]', true) ?: [];
    $baseNotes = json_decode($p['base_notes'] ?? '[]', true) ?: [];
    $attributes = json_decode($p['attributes_json'] ?? '[]', true) ?: [];
    $scentProfile = json_decode($p['scent_profile_json'] ?? '{}', true) ?: new \stdClass();

    $sizes = $variantsByProduct[$p['id']] ?? [];
    if (empty($sizes)) {
        $sizes = [['size' => '5ml', 'price' => (float)$p['starting_price'], 'stock_qty' => (int)$p['inventory_qty']]];
    }

    $additionalImages = $imagesByProduct[$p['id']] ?? [];
    $allImages = array_values(array_unique(array_filter(array_merge([$p['image']], $additionalImages))));

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
        'images' => $allImages,
        'additionalImages' => $additionalImages,
        'notes' => $notes,
        'topNotes' => $topNotes,
        'heartNotes' => $heartNotes,
        'baseNotes' => $baseNotes,
        'attributes' => $attributes,
        'scentProfile' => $scentProfile,
        'scent_profile' => $scentProfile,
        'sizes' => $sizes,
        'shortDescription' => $p['short_description'],
        'description' => $p['description'] ?? ''
    ];
}, $products);

jsonResponse($formattedList, 200);
