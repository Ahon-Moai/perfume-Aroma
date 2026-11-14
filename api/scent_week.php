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

    jsonResponse([
        'week' => $week,
        'lead' => $lead,
        'items' => array_map(fn($r) => ['product_id' => $r['product_id'], 'gender' => $r['gender'], 'ml_sold' => round($r['ml'], 1)], $items),
    ]);
} catch (Throwable $e) {
    jsonResponse(['week' => $week, 'lead' => $lead, 'items' => []]);
}
