<?php
/**
 * Admin: one place for prices and ml stock.
 * GET  -> every perfume with its sizes/prices and bottle (ml left, bottle size, low mark, bottle cost)
 * PUT  -> save edits in one go:
 *         { changes: [ { product_id, prices: { "<variant_id>": 590, ... }, bottle_cost, bottle_size_ml, low_stock_threshold_ml, set_ml } ] }
 * POST -> { product_id, action: "restock" | "remove", ml, note }  (new bottle / spill, tester, etc.)
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();
$who = $admin['username'] ?? 'admin';
$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function ppEnsureBottleCost(PDO $db): void {
    try { $db->query("SELECT bottle_cost FROM perfume_inventory LIMIT 1"); return; } catch (\Throwable $e) {}
    try { $db->exec("ALTER TABLE perfume_inventory ADD COLUMN bottle_cost DECIMAL(10,2) NOT NULL DEFAULT 0"); } catch (\Throwable $e) {}
}
ppEnsureBottleCost($db);

/** Bottle row for a product; creates one (100ml) if missing. */
function ppBottle(PDO $db, string $pid): array {
    $s = $db->prepare("SELECT * FROM perfume_inventory WHERE product_id = ? LIMIT 1");
    $s->execute([$pid]);
    $b = $s->fetch();
    if ($b) return $b;
    $p = $db->prepare("SELECT name, brand FROM products WHERE id = ?");
    $p->execute([$pid]);
    $pr = $p->fetch();
    if (!$pr) jsonError('Perfume not found', 404);
    $id = 'inv-' . substr(bin2hex(random_bytes(6)), 0, 10);
    $db->prepare("INSERT INTO perfume_inventory (id, product_id, brand, name, bottle_size_ml, remaining_ml, low_stock_threshold_ml) VALUES (?, ?, ?, ?, 100, 0, 15)")
       ->execute([$id, $pid, $pr['brand'], $pr['name']]);
    $s->execute([$pid]);
    return $s->fetch();
}

function ppLog(PDO $db, string $invId, string $type, float $change, float $prev, float $new, string $note, string $who): void {
    $db->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)")
       ->execute([$invId, $type, $change, $prev, $new, $note, $who]);
}

if ($method === 'GET') {
    $products = $db->query("SELECT id, brand, name, slug, image, status FROM products ORDER BY brand ASC, name ASC")->fetchAll();
    $vars = $db->query("SELECT id, product_id, size, price FROM product_variants")->fetchAll();
    $inv = $db->query("SELECT * FROM perfume_inventory WHERE product_id IS NOT NULL")->fetchAll();
    $vBy = []; foreach ($vars as $v) $vBy[$v['product_id']][] = ['id' => $v['id'], 'size' => $v['size'], 'ml' => parseDecantMl($v['size']), 'price' => (float)$v['price']];
    $iBy = []; foreach ($inv as $i) $iBy[$i['product_id']] = $i;
    $out = [];
    foreach ($products as $p) {
        $sizes = $vBy[$p['id']] ?? [];
        usort($sizes, fn($a, $b) => $a['ml'] <=> $b['ml']);
        $b = $iBy[$p['id']] ?? null;
        $out[] = [
            'id' => $p['id'], 'brand' => $p['brand'], 'name' => $p['name'], 'slug' => $p['slug'],
            'image' => $p['image'], 'status' => $p['status'], 'sizes' => $sizes,
            'bottle_size_ml' => $b ? (float)$b['bottle_size_ml'] : 100.0,
            'ml_left' => $b ? (float)$b['remaining_ml'] : null,
            'low_ml' => $b ? (float)$b['low_stock_threshold_ml'] : 15.0,
            'bottle_cost' => $b ? (float)($b['bottle_cost'] ?? 0) : 0.0,
            'updated_at' => $b['updated_at'] ?? null,
        ];
    }
    jsonResponse(['perfumes' => $out], 200);
}

if ($method === 'PUT') {
    $in = getJsonInput();
    $changes = is_array($in['changes'] ?? null) ? $in['changes'] : [];
    if (empty($changes)) jsonError('Nothing to save', 400);
    try {
        $db->beginTransaction();
        $vp = $db->prepare("UPDATE product_variants SET price = ? WHERE id = ? AND product_id = ?");
        $minP = $db->prepare("UPDATE products SET starting_price = (SELECT MIN(price) FROM product_variants WHERE product_id = ? AND is_available = 1) WHERE id = ?");
        $saved = 0;
        foreach ($changes as $ch) {
            $pid = sanitizeString($ch['product_id'] ?? '');
            if (!$pid) continue;
            if (!empty($ch['prices']) && is_array($ch['prices'])) {
                foreach ($ch['prices'] as $vid => $price) {
                    $price = round((float)$price);
                    if ($price <= 0) throw new Exception('Prices must be above 0');
                    $vp->execute([$price, $vid, $pid]);
                    $saved++;
                }
                $minP->execute([$pid, $pid]);
            }
            $hasBottle = isset($ch['bottle_cost']) || isset($ch['bottle_size_ml']) || isset($ch['low_stock_threshold_ml']) || isset($ch['set_ml']);
            if ($hasBottle) {
                $b = ppBottle($db, $pid);
                $cost = isset($ch['bottle_cost']) ? max(0, (float)$ch['bottle_cost']) : (float)($b['bottle_cost'] ?? 0);
                $size = isset($ch['bottle_size_ml']) ? max(1, (float)$ch['bottle_size_ml']) : (float)$b['bottle_size_ml'];
                $low = isset($ch['low_stock_threshold_ml']) ? max(0, (float)$ch['low_stock_threshold_ml']) : (float)$b['low_stock_threshold_ml'];
                $prev = (float)$b['remaining_ml'];
                $left = isset($ch['set_ml']) ? max(0, round((float)$ch['set_ml'], 2)) : $prev;
                $db->prepare("UPDATE perfume_inventory SET bottle_cost = ?, bottle_size_ml = ?, low_stock_threshold_ml = ?, remaining_ml = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                   ->execute([$cost, $size, $low, $left, $b['id']]);
                if ($left != $prev) ppLog($db, $b['id'], 'manual_adjustment', round($left - $prev, 2), $prev, $left, 'Set by admin on Perfumes page', $who);
                $saved++;
            }
        }
        $db->commit();
        jsonResponse(['saved' => $saved], 200, 'Saved');
    } catch (\Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Couldn’t save: ' . $e->getMessage(), 400);
    }
}

if ($method === 'POST') {
    $in = getJsonInput();
    $pid = sanitizeString($in['product_id'] ?? '');
    $action = $in['action'] ?? '';
    $ml = round((float)($in['ml'] ?? 0), 2);
    $note = trim(sanitizeString($in['note'] ?? '') ?? '');
    if (!$pid || $ml <= 0 || !in_array($action, ['restock', 'remove'], true)) jsonError('Enter the ml', 400);
    $db->beginTransaction();
    $b = ppBottle($db, $pid);
    $prev = (float)$b['remaining_ml'];
    if ($action === 'remove' && $ml > $prev) { $db->rollBack(); jsonError("Only {$prev}ml left", 400); }
    $new = $action === 'restock' ? $prev + $ml : $prev - $ml;
    $db->prepare("UPDATE perfume_inventory SET remaining_ml = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$new, $b['id']]);
    ppLog($db, $b['id'], $action === 'restock' ? 'restock' : 'manual_adjustment', $action === 'restock' ? $ml : -$ml, $prev, $new,
        $note !== '' ? $note : ($action === 'restock' ? 'New bottle' : 'Removed (spill / tester)'), $who);
    $db->commit();
    jsonResponse(['ml_left' => $new], 200, 'Updated');
}

jsonError('Method not allowed', 405);
