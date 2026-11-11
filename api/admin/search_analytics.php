<?php
/**
 * Admin Popular Search Analytics & Decant Availability REST Endpoint
 *
 * Provides:
 * - Summary KPIs (total searches, unique terms, zero-result searches, zero-stock searches)
 * - Most searched perfumes with search frequency and real-time decant availability
 * - Searches with no matching catalog product (unmatched demand)
 * - Most searched perfumes currently out of stock / zero stock
 * - Popular searches with low or zero order conversion
 * - Time series search trends
 * - Date filters: today, 7d, 30d, all
 * - Server-side aggregation with GROUP BY & pagination
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    jsonError('Method not allowed', 405);
}

$period = $_GET['period'] ?? '30d'; // today, 7d, 30d, all
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(5, min(100, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;
$searchFilter = sanitizeString($_GET['search'] ?? null);

// Date Boundaries
$now = new DateTime('now');
$endDate = clone $now;
$startDate = clone $now;

if ($period === 'today') {
    $startDate->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);
} elseif ($period === '7d') {
    $startDate->modify('-7 days')->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);
} elseif ($period === 'all') {
    $startDate = new DateTime('2000-01-01 00:00:00');
    $endDate->setTime(23, 59, 59);
} else { // default '30d'
    $startDate->modify('-30 days')->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);
}

$sDate = $startDate->format('Y-m-d H:i:s');
$eDate = $endDate->format('Y-m-d H:i:s');

// 1. Summary KPIs
$kpiStmt = $db->prepare("
    SELECT
        COUNT(id) AS total_searches,
        COUNT(DISTINCT normalized_term) AS unique_queries,
        COUNT(CASE WHEN matched_product_id IS NULL AND result_count = 0 THEN 1 END) AS zero_result_searches
    FROM search_logs
    WHERE created_at BETWEEN ? AND ?
");
$kpiStmt->execute([$sDate, $eDate]);
$kpi = $kpiStmt->fetch();

$totalSearches = (int)($kpi['total_searches'] ?? 0);
$uniqueQueries = (int)($kpi['unique_queries'] ?? 0);
$zeroResultSearches = (int)($kpi['zero_result_searches'] ?? 0);

// Calculate search frequency (searches per day)
$daySpan = max(1, $startDate->diff($endDate)->days + 1);
$avgSearchesPerDay = round($totalSearches / $daySpan, 1);

// 2. Search Trend Time Series (Daily aggregation)
$trendStmt = $db->prepare("
    SELECT
        DATE(created_at) AS date_key,
        COUNT(id) AS search_count
    FROM search_logs
    WHERE created_at BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date_key ASC
");
$trendStmt->execute([$sDate, $eDate]);
$trendRows = $trendStmt->fetchAll();
$trendMap = [];
foreach ($trendRows as $tr) {
    $trendMap[$tr['date_key']] = (int)$tr['search_count'];
}

$trendSeries = [];
$cDate = clone $startDate;
// If period is 'all' and span is huge, cap series display to last 30 days or daily points
$maxTrendDays = ($period === 'all') ? 30 : $daySpan;
if ($period === 'all') {
    $cDate = (clone $now)->modify('-30 days')->setTime(0, 0, 0);
}
while ($cDate <= $endDate) {
    $dStr = $cDate->format('Y-m-d');
    $trendSeries[] = [
        'date' => $dStr,
        'count' => $trendMap[$dStr] ?? 0
    ];
    $cDate->modify('+1 day');
}

// 3. Most Searched Perfumes (Grouped by matched perfume or search term)
$whereClause = "WHERE sl.created_at BETWEEN ? AND ?";
$params = [$sDate, $eDate];

if ($searchFilter) {
    $whereClause .= " AND (sl.search_term LIKE ? OR sl.normalized_term LIKE ? OR p.name LIKE ? OR p.brand LIKE ?)";
    $st = '%' . $searchFilter . '%';
    $params[] = $st;
    $params[] = $st;
    $params[] = $st;
    $params[] = $st;
}

$perfumeCountSql = "
    SELECT COUNT(*) FROM (
        SELECT COALESCE(sl.matched_product_id, sl.normalized_term) AS grouping_key
        FROM search_logs sl
        LEFT JOIN products p ON sl.matched_product_id = p.id
        $whereClause
        GROUP BY grouping_key
    ) AS grp
";
$cntStmt = $db->prepare($perfumeCountSql);
$cntStmt->execute($params);
$totalPerfumeItems = (int)$cntStmt->fetchColumn();

// Fetch paginated top searched perfumes
$perfumeListSql = "
    SELECT
        COALESCE(sl.matched_product_id, '') AS product_id,
        MIN(sl.search_term) AS sample_search_term,
        sl.normalized_term,
        COUNT(sl.id) AS search_count,
        MAX(sl.created_at) AS last_searched_at,
        p.name AS product_name,
        p.brand AS product_brand,
        p.image AS product_image,
        p.slug AS product_slug,
        p.starting_price,
        p.status AS product_status,
        p.inventory_qty AS product_inventory_qty
    FROM search_logs sl
    LEFT JOIN products p ON sl.matched_product_id = p.id
    $whereClause
    GROUP BY COALESCE(sl.matched_product_id, sl.normalized_term)
    ORDER BY search_count DESC, last_searched_at DESC
    LIMIT $limit OFFSET $offset
";
$listStmt = $db->prepare($perfumeListSql);
$listStmt->execute($params);
$perfumeRows = $listStmt->fetchAll();

// Dynamic availability integration for each perfume row
$perfumeAnalytics = [];
$totalZeroStockSearches = 0;

foreach ($perfumeRows as $row) {
    $pId = !empty($row['product_id']) ? $row['product_id'] : null;
    $availability = calculateProductDecantAvailability($db, $pId);

    // Calculate search frequency percentage of total searches in period
    $searchPct = $totalSearches > 0 ? round(((int)$row['search_count'] / $totalSearches) * 100, 1) : 0;

    // Check order conversion for this product
    $ordersCount = 0;
    if ($pId) {
        $ordStmt = $db->prepare("
            SELECT COUNT(DISTINCT o.id) AS order_cnt
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE oi.product_id = ? AND o.order_status != 'cancelled'
              AND o.created_at BETWEEN ? AND ?
        ");
        $ordStmt->execute([$pId, $sDate, $eDate]);
        $ordersCount = (int)$ordStmt->fetchColumn();
    }

    $perfumeAnalytics[] = [
        'product_id' => $pId,
        'search_term' => $row['sample_search_term'],
        'normalized_term' => $row['normalized_term'],
        'search_count' => (int)$row['search_count'],
        'search_percentage' => $searchPct,
        'last_searched_at' => $row['last_searched_at'],
        'product_name' => $row['product_name'] ?? ucwords($row['normalized_term']),
        'product_brand' => $row['product_brand'] ?? 'Unlisted',
        'product_image' => $row['product_image'] ?? '',
        'product_slug' => $row['product_slug'] ?? '',
        'starting_price' => isset($row['starting_price']) ? (float)$row['starting_price'] : 0.00,
        'orders_count' => $ordersCount,
        'availability' => $availability
    ];
}

// 4. Searches with No Matching Products (Unmatched Demand)
$unmatchedStmt = $db->prepare("
    SELECT
        normalized_term,
        MIN(search_term) AS search_term,
        COUNT(id) AS search_count,
        MAX(created_at) AS last_searched_at
    FROM search_logs
    WHERE matched_product_id IS NULL AND result_count = 0
      AND created_at BETWEEN ? AND ?
    GROUP BY normalized_term
    ORDER BY search_count DESC, last_searched_at DESC
    LIMIT 15
");
$unmatchedStmt->execute([$sDate, $eDate]);
$unmatchedSearches = $unmatchedStmt->fetchAll();

// 5. Most Searched Unavailable / Zero-Stock Perfumes
// Query matched products and check real-time stock
$zeroStockCandidateStmt = $db->prepare("
    SELECT
        sl.matched_product_id,
        MIN(sl.search_term) AS search_term,
        sl.normalized_term,
        COUNT(sl.id) AS search_count,
        MAX(sl.created_at) AS last_searched_at,
        p.name,
        p.brand,
        p.image
    FROM search_logs sl
    JOIN products p ON sl.matched_product_id = p.id
    WHERE sl.created_at BETWEEN ? AND ?
    GROUP BY sl.matched_product_id
    ORDER BY search_count DESC
    LIMIT 50
");
$zeroStockCandidateStmt->execute([$sDate, $eDate]);
$allCandidates = $zeroStockCandidateStmt->fetchAll();

$zeroStockSearches = [];
foreach ($allCandidates as $cand) {
    $avail = calculateProductDecantAvailability($db, $cand['matched_product_id']);
    if ($avail['status'] === 'unavailable' || $avail['status'] === 'low_stock') {
        $zeroStockSearches[] = [
            'product_id' => $cand['matched_product_id'],
            'search_term' => $cand['search_term'],
            'search_count' => (int)$cand['search_count'],
            'last_searched_at' => $cand['last_searched_at'],
            'name' => $cand['name'],
            'brand' => $cand['brand'],
            'image' => $cand['image'],
            'availability' => $avail
        ];
    }
}

// Slice to top 15
$zeroStockSearches = array_slice($zeroStockSearches, 0, 15);

// 6. Popular searches that have NOT resulted in purchases
$noPurchaseSearches = [];
foreach ($perfumeAnalytics as $item) {
    if ($item['orders_count'] === 0 && $item['search_count'] >= 1) {
        $noPurchaseSearches[] = $item;
    }
}
$noPurchaseSearches = array_slice($noPurchaseSearches, 0, 15);

jsonResponse([
    'period' => $period,
    'start_date' => $sDate,
    'end_date' => $eDate,
    'kpis' => [
        'total_searches' => $totalSearches,
        'unique_queries' => $uniqueQueries,
        'zero_result_searches' => $zeroResultSearches,
        'avg_searches_per_day' => $avgSearchesPerDay,
        'unavailable_searches_count' => count($zeroStockSearches)
    ],
    'trend_series' => $trendSeries,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total_items' => $totalPerfumeItems,
        'total_pages' => ceil($totalPerfumeItems / $limit)
    ],
    'most_searched_perfumes' => $perfumeAnalytics,
    'unmatched_searches' => $unmatchedSearches,
    'zero_stock_searches' => $zeroStockSearches,
    'no_purchase_searches' => $noPurchaseSearches
], 200);
