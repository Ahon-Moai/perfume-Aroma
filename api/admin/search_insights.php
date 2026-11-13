<?php
/**
 * Admin: simple search insights
 * Returns four short lists for a period (today, 7d, 30d, all):
 *  - not_in_list   : searched, nothing in the catalogue (similar spellings grouped)
 *  - most_searched : catalogue perfumes / brands customers look for most
 *  - low_stock     : searched perfumes that are low or out of stock
 *  - not_bought    : searched perfumes with no order in the period
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';
require_once __DIR__ . '/../search_fuzzy.php';

sendCorsAndHeaders();
requireAdminAuth();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') jsonError('Method not allowed', 405);

$db = Database::getConnection();
$period = $_GET['period'] ?? '30d';
$start = new DateTime('now');
if ($period === 'today') $start->setTime(0, 0, 0);
elseif ($period === '7d') $start->modify('-6 days')->setTime(0, 0, 0);
elseif ($period === 'all') $start = new DateTime('2000-01-01');
else { $period = '30d'; $start->modify('-29 days')->setTime(0, 0, 0); }
$s = $start->format('Y-m-d H:i:s');
$e = (new DateTime('now'))->setTime(23, 59, 59)->format('Y-m-d H:i:s');

$total = $db->prepare("SELECT COUNT(*) FROM search_logs WHERE created_at BETWEEN ? AND ?");
$total->execute([$s, $e]);
$totalSearches = (int)$total->fetchColumn();

// Perfumes in the catalogue that were searched
$pq = $db->prepare("
    SELECT sl.matched_product_id AS id, COUNT(*) AS cnt, p.name, p.brand, p.slug
    FROM search_logs sl JOIN products p ON p.id = sl.matched_product_id
    WHERE sl.created_at BETWEEN ? AND ?
    GROUP BY sl.matched_product_id, p.name, p.brand, p.slug
    ORDER BY cnt DESC LIMIT 40
");
$pq->execute([$s, $e]);
$products = [];
$ord = $db->prepare("
    SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON oi.order_id = o.id
    WHERE oi.product_id = ? AND o.order_status != 'cancelled' AND o.created_at BETWEEN ? AND ?
");
foreach ($pq->fetchAll() as $r) {
    $av = calculateProductDecantAvailability($db, $r['id']);
    $ord->execute([$r['id'], $s, $e]);
    $products[] = [
        'key' => $r['id'],
        'name' => $r['name'],
        'brand' => $r['brand'],
        'slug' => $r['slug'],
        'count' => (int)$r['cnt'],
        'stock' => $av['status'] === 'unavailable' ? 'out' : ($av['status'] === 'low_stock' ? 'low' : 'ok'),
        'orders' => (int)$ord->fetchColumn(),
    ];
}

// Searches with results but no single perfume (brands, notes like "vanilla")
$gq = $db->prepare("
    SELECT normalized_term AS t, COUNT(*) AS cnt FROM search_logs
    WHERE matched_product_id IS NULL AND result_count > 0 AND created_at BETWEEN ? AND ?
    GROUP BY normalized_term ORDER BY cnt DESC LIMIT 40
");
$gq->execute([$s, $e]);
$general = [];
foreach ($gq->fetchAll() as $r) {
    $general[] = ['key' => 't:' . $r['t'], 'name' => ucwords($r['t']), 'brand' => null, 'slug' => null, 'count' => (int)$r['cnt'], 'stock' => 'ok', 'orders' => null];
}

// Nothing found: group similar spellings, show the most-used spelling
$uq = $db->prepare("
    SELECT normalized_term AS t, MIN(search_term) AS label, COUNT(*) AS cnt FROM search_logs
    WHERE matched_product_id IS NULL AND result_count = 0 AND created_at BETWEEN ? AND ?
    GROUP BY normalized_term ORDER BY cnt DESC LIMIT 300
");
$uq->execute([$s, $e]);
$counts = []; $labels = [];
foreach ($uq->fetchAll() as $r) { $counts[$r['t']] = (int)$r['cnt']; $labels[$r['t']] = $r['label']; }
$map = ppClusterTerms($counts);
$groups = [];
foreach ($map as $term => $head) {
    if (!isset($groups[$head])) $groups[$head] = ['key' => 'u:' . $head, 'name' => ucwords($head), 'count' => 0, 'spellings' => []];
    $groups[$head]['count'] += $counts[$term];
    if ($term !== $head) $groups[$head]['spellings'][] = $term;
}
$notInList = array_values($groups);
usort($notInList, fn($a, $b) => $b['count'] <=> $a['count']);

$most = array_merge($products, $general);
usort($most, fn($a, $b) => $b['count'] <=> $a['count']);

jsonResponse([
    'period' => $period,
    'total_searches' => $totalSearches,
    'not_in_list' => array_slice($notInList, 0, 20),
    'most_searched' => array_slice($most, 0, 20),
    'low_stock' => array_values(array_slice(array_filter($products, fn($p) => $p['stock'] !== 'ok'), 0, 20)),
    'not_bought' => array_values(array_slice(array_filter($products, fn($p) => $p['orders'] === 0), 0, 20)),
], 200);
