<?php
/**
 * Admin Collections CRUD REST Endpoint
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
        $stmt = $db->prepare("SELECT * FROM collections WHERE id = ?");
        $stmt->execute([$id]);
        $col = $stmt->fetch();

        if (!$col) {
            jsonError('Collection not found', 404);
        }

        $mapStmt = $db->prepare("SELECT product_id FROM collection_products WHERE collection_id = ?");
        $mapStmt->execute([$id]);
        $col['mapped_product_ids'] = array_column($mapStmt->fetchAll(), 'product_id');

        jsonResponse($col, 200);
    } else {
        $stmt = $db->query("SELECT * FROM collections ORDER BY display_order ASC, title ASC");
        $collections = $stmt->fetchAll();

        foreach ($collections as &$col) {
            $mapStmt = $db->prepare("SELECT product_id FROM collection_products WHERE collection_id = ?");
            $mapStmt->execute([$col['id']]);
            $col['mapped_product_ids'] = array_column($mapStmt->fetchAll(), 'product_id');
        }

        jsonResponse($collections, 200);
    }

} elseif ($method === 'POST') {
    $input = getJsonInput();

    $id = sanitizeString($input['id'] ?? ('col-' . bin2hex(random_bytes(4))));
    $title = sanitizeString($input['title'] ?? '');
    $slug = sanitizeString($input['slug'] ?? slugify($title));
    $description = sanitizeString($input['description'] ?? '');
    $image = sanitizeString($input['image'] ?? '');
    $ruleType = sanitizeString($input['rule_type'] ?? 'manual');
    $ruleValue = sanitizeString($input['rule_value'] ?? '');
    $displayOrder = (int)($input['display_order'] ?? 0);
    $isEnabled = !empty($input['is_enabled']) ? 1 : 0;
    $mappedProductIds = $input['mapped_product_ids'] ?? [];

    if (empty($title)) {
        jsonError('Collection title is required', 400);
    }

    try {
        $db->beginTransaction();

        $stmt = $db->prepare("INSERT INTO collections (id, title, slug, description, image, rule_type, rule_value, display_order, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $title, $slug, $description, $image, $ruleType, $ruleValue, $displayOrder, $isEnabled]);

        if (is_array($mappedProductIds) && !empty($mappedProductIds)) {
            $mapStmt = $db->prepare("INSERT INTO collection_products (collection_id, product_id) VALUES (?, ?)");
            foreach ($mappedProductIds as $pId) {
                if (!empty(trim($pId))) {
                    $mapStmt->execute([$id, trim($pId)]);
                }
            }
        }

        $db->commit();
        jsonResponse(['id' => $id], 201, 'Collection created successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to create collection: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);

    if (!$id) {
        jsonError('Collection ID required', 400);
    }

    $title = sanitizeString($input['title'] ?? '');
    $slug = sanitizeString($input['slug'] ?? slugify($title));
    $description = sanitizeString($input['description'] ?? '');
    $image = sanitizeString($input['image'] ?? '');
    $ruleType = sanitizeString($input['rule_type'] ?? 'manual');
    $ruleValue = sanitizeString($input['rule_value'] ?? '');
    $displayOrder = (int)($input['display_order'] ?? 0);
    $isEnabled = !empty($input['is_enabled']) ? 1 : 0;
    $mappedProductIds = $input['mapped_product_ids'] ?? null;

    try {
        $db->beginTransaction();

        $db->exec("UPDATE collections SET title = " . $db->quote($title) . ", slug = " . $db->quote($slug) . ", description = " . $db->quote($description) . ($image ? ", image = " . $db->quote($image) : "") . ", rule_type = " . $db->quote($ruleType) . ", rule_value = " . $db->quote($ruleValue) . ", display_order = $displayOrder, is_enabled = $isEnabled WHERE id = " . $db->quote($id));

        if (is_array($mappedProductIds)) {
            $db->exec("DELETE FROM collection_products WHERE collection_id = " . $db->quote($id));
            $mapStmt = $db->prepare("INSERT INTO collection_products (collection_id, product_id) VALUES (?, ?)");
            foreach ($mappedProductIds as $pId) {
                if (!empty(trim($pId))) {
                    $mapStmt->execute([$id, trim($pId)]);
                }
            }
        }

        $db->commit();
        jsonResponse(null, 200, 'Collection updated successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to update collection: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'DELETE') {
    $id = sanitizeString($_GET['id'] ?? null);
    if (!$id) {
        jsonError('Collection ID required', 400);
    }

    $db->exec("DELETE FROM collection_products WHERE collection_id = " . $db->quote($id));
    $db->exec("DELETE FROM collections WHERE id = " . $db->quote($id));

    jsonResponse(null, 200, 'Collection deleted');
} else {
    jsonError('Method not allowed', 405);
}
