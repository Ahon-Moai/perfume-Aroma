<?php
/**
 * Scent of the Week
 * Picks this week's best sellers (by ml sold, website + offline orders, cancelled excluded),
 * mixing For him / For her / Unisex. The lead gender rotates every week.
 * Falls back to a longer window when the last 14 days are quiet.
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') exit(0);

$db = Database::getConnection();
$isSqlite = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

$tz = new DateTimeZone('Asia/Dhaka');
$now = new DateTime('now', $tz);
$week = (int)$now->format('W');

$genders = ['Unisex', 'Him', 'Her'];
$lead = $genders[$week % 3];
$order = [$lead];
foreach ($genders as $g) if ($g !== $lead) $order[] = $g;

function soldByProduct(PDO $db, bool $isSqlite, int $days): array {
    $since = $isSqlite ? "datetime('now', '-{$days} days')" : "DATE_SUB(NOW(), INTERVAL {$days} DAY)";
    $sql = "SELECT oi.product_id, oi.selected_size, oi.quantity, p.gender
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE o.order_status != 'cancelled' AND p.status = 'published' AND o.created_at >= {$since}";
    $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    $out = [];
    foreach ($rows as $r) {
        $ml = (float)preg_replace('/[^\d.]/', '', (string)$r['selected_size']);
        if ($ml <= 0) $ml = 1;
        $id = (string)$r['product_id'];
        if (!isset($out[$id])) $out[$id] = ['product_id' => $id, 'gender' => $r['gender'] ?: 'Unisex', 'ml' => 0, 'orders' => 0];
        $out[$id]['ml'] += $ml * max(1, (int)$r['quantity']);
        $out[$id]['orders'] += max(1, (int)$r['quantity']);
    }
    return $out;
}

try {
    $sold = soldByProduct($db, $isSqlite, 14);
    if (count($sold) < 6) {
        foreach (soldByProduct($db, $isSqlite, 90) as $id => $row) {
            if (!isset($sold[$id])) $sold[$id] = $row;
        }
    }
    $byGender = ['Him' => [], 'Her' => [], 'Unisex' => []];
    foreach ($sold as $row) {
        $g = in_array($row['gender'], ['Him', 'Her', 'Unisex'], true) ? $row['gender'] : 'Unisex';
        $byGender[$g][] = $row;
    }
    foreach ($byGender as &$list) usort($list, fn($a, $b) => $b['ml'] <=> $a['ml']);
    unset($list);

    // Interleave: lead gender first, two rounds → up to 6 picks
    $items = [];
    for ($round = 0; $round < 2; $round++) {
        foreach ($order as $g) {
            if (isset($byGender[$g][$round])) $items[] = $byGender[$g][$round];
        }
    }

    $auto = array_map(fn($r) => ['product_id' => $r['product_id'], 'gender' => $r['gender'], 'ml_sold' => round($r['ml'], 1), 'source' => 'auto'], $items);

    // Manual picks from Admin → Homepage → Scent of the week
    $mode = 'auto';
    $final = $auto;
    if (empty($_GET['auto'])) {
        $cfgRow = $db->prepare("SELECT content_json FROM homepage_sections WHERE section_key = 'scent_week' LIMIT 1");
        $cfgRow->execute();
        $cfg = json_decode((string)($cfgRow->fetchColumn() ?: '{}'), true) ?: [];
        $ids = array_values(array_filter(array_map('strval', (array)($cfg['product_ids'] ?? []))));
        if (($cfg['mode'] ?? 'auto') === 'manual' && $ids) {
            $mode = 'manual';
            $in = implode(',', array_fill(0, count($ids), '?'));
            $st = $db->prepare("SELECT id, gender FROM products WHERE status = 'published' AND id IN ($in)");
            $st->execute($ids);
            $pub = [];
            foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) $pub[(string)$r['id']] = $r['gender'] ?: 'Unisex';
            $final = [];
            foreach ($ids as $id) {
                if (isset($pub[$id])) $final[] = ['product_id' => $id, 'gender' => $pub[$id], 'ml_sold' => $sold[$id]['ml'] ?? 0, 'source' => 'manual'];
            }
            if (!empty($cfg['fill_auto'])) {
                foreach ($auto as $a) {
                    if (count($final) >= 6) break;
                    if (!in_array($a['product_id'], array_column($final, 'product_id'), true)) $final[] = $a;
                }
            }
            $final = array_slice($final, 0, 6);
        }
    }

    jsonResponse(['week' => $week, 'lead' => $lead, 'mode' => $mode, 'items' => $final]);
} catch (Throwable $e) {
    jsonResponse(['week' => $week, 'lead' => $lead, 'items' => []]);
}
