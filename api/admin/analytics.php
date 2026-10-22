<?php
/**
 * Admin Analytics & Statistics REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    jsonError('Method not allowed', 405);
}

$period = $_GET['period'] ?? '30d'; // today, 7d, 30d, 90d, all, custom
$startDateParam = $_GET['start_date'] ?? null;
$endDateParam = $_GET['end_date'] ?? null;

// Determine current and comparison date boundaries
$now = new DateTime('now');
$endDate = clone $now;
$startDate = clone $now;

if ($period === 'today') {
    $startDate->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);

    $prevStartDate = (clone $startDate)->modify('-1 day');
    $prevEndDate = (clone $endDate)->modify('-1 day');
} elseif ($period === '7d') {
    $startDate->modify('-7 days')->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);

    $prevStartDate = (clone $startDate)->modify('-7 days');
    $prevEndDate = (clone $startDate)->modify('-1 second');
} elseif ($period === '90d') {
    $startDate->modify('-90 days')->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);

    $prevStartDate = (clone $startDate)->modify('-90 days');
    $prevEndDate = (clone $startDate)->modify('-1 second');
} elseif ($period === 'all') {
    $startDate = new DateTime('2000-01-01 00:00:00');
    $endDate->setTime(23, 59, 59);

    $prevStartDate = null;
    $prevEndDate = null;
} elseif ($period === 'custom' && $startDateParam && $endDateParam) {
    try {
        $startDate = new DateTime($startDateParam . ' 00:00:00');
        $endDate = new DateTime($endDateParam . ' 23:59:59');
        $intervalDays = max(1, $startDate->diff($endDate)->days + 1);

        $prevStartDate = (clone $startDate)->modify("-{$intervalDays} days");
        $prevEndDate = (clone $startDate)->modify('-1 second');
    } catch (\Exception $e) {
        jsonError('Invalid custom date range', 400);
    }
} else { // default '30d'
    $startDate->modify('-30 days')->setTime(0, 0, 0);
    $endDate->setTime(23, 59, 59);

    $prevStartDate = (clone $startDate)->modify('-30 days');
    $prevEndDate = (clone $startDate)->modify('-1 second');
}

$sDate = $startDate->format('Y-m-d H:i:s');
$eDate = $endDate->format('Y-m-d H:i:s');

$pSDate = $prevStartDate ? $prevStartDate->format('Y-m-d H:i:s') : null;
$pEDate = $prevEndDate ? $prevEndDate->format('Y-m-d H:i:s') : null;

// 1. Current Period Summary KPIs
$kpiStmt = $db->prepare("
    SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(id) AS total_orders
    FROM orders
    WHERE order_status != 'cancelled'
      AND created_at BETWEEN ? AND ?
");
$kpiStmt->execute([$sDate, $eDate]);
$kpiRes = $kpiStmt->fetch();

$totalRevenue = (float)$kpiRes['total_revenue'];
$totalOrders = (int)$kpiRes['total_orders'];
$aov = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0.00;

// Total Units Sold in Period
$unitsStmt = $db->prepare("
    SELECT COALESCE(SUM(oi.quantity), 0) AS total_units
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.order_status != 'cancelled'
      AND o.created_at BETWEEN ? AND ?
");
$unitsStmt->execute([$sDate, $eDate]);
$unitsRes = $unitsStmt->fetch();
$totalUnits = (int)$unitsRes['total_units'];

// Total Unique Customers in Period
$custStmt = $db->prepare("
    SELECT COUNT(DISTINCT customer_phone) AS active_customers
    FROM orders
    WHERE order_status != 'cancelled'
      AND created_at BETWEEN ? AND ?
");
$custStmt->execute([$sDate, $eDate]);
$custRes = $custStmt->fetch();
$totalCustomers = (int)$custRes['active_customers'];

// Total Pending Orders (Current)
$pendingStmt = $db->prepare("SELECT COUNT(id) as pending_cnt FROM orders WHERE order_status = 'pending'");
$pendingStmt->execute();
$pendingRes = $pendingStmt->fetch();
$pendingOrders = (int)$pendingRes['pending_cnt'];

// 2. Previous Period Summary KPIs (for comparison percentages)
$prevRevenue = 0.0;
$prevOrders = 0;
$prevUnits = 0;
$prevAov = 0.0;
$prevCustomers = 0;

if ($pSDate && $pEDate) {
    $pKpiStmt = $db->prepare("
        SELECT
            COALESCE(SUM(total_amount), 0) AS total_revenue,
            COUNT(id) AS total_orders
        FROM orders
        WHERE order_status != 'cancelled'
          AND created_at BETWEEN ? AND ?
    ");
    $pKpiStmt->execute([$pSDate, $pEDate]);
    $pKpiRes = $pKpiStmt->fetch();
    $prevRevenue = (float)$pKpiRes['total_revenue'];
    $prevOrders = (int)$pKpiRes['total_orders'];
    $prevAov = $prevOrders > 0 ? round($prevRevenue / $prevOrders, 2) : 0.00;

    $pUnitsStmt = $db->prepare("
        SELECT COALESCE(SUM(oi.quantity), 0) AS total_units
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.order_status != 'cancelled'
          AND o.created_at BETWEEN ? AND ?
    ");
    $pUnitsStmt->execute([$pSDate, $pEDate]);
    $pUnitsRes = $pUnitsStmt->fetch();
    $prevUnits = (int)$pUnitsRes['total_units'];

    $pCustStmt = $db->prepare("
        SELECT COUNT(DISTINCT customer_phone) AS active_customers
        FROM orders
        WHERE order_status != 'cancelled'
          AND created_at BETWEEN ? AND ?
    ");
    $pCustStmt->execute([$pSDate, $pEDate]);
    $pCustRes = $pCustStmt->fetch();
    $prevCustomers = (int)$pCustRes['active_customers'];
}

// 3. Daily Revenue / Order Time Series Chart Data
$chartStmt = $db->prepare("
    SELECT
        DATE(created_at) AS date_key,
        COALESCE(SUM(total_amount), 0) AS daily_revenue,
        COUNT(id) AS daily_orders
    FROM orders
    WHERE order_status != 'cancelled'
      AND created_at BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date_key ASC
");
$chartStmt->execute([$sDate, $eDate]);
$chartRaw = $chartStmt->fetchAll();

// Fill missing date gaps for smooth charts
$chartMap = [];
foreach ($chartRaw as $row) {
    $chartMap[$row['date_key']] = [
        'date' => $row['date_key'],
        'revenue' => (float)$row['daily_revenue'],
        'orders' => (int)$row['daily_orders']
    ];
}

$chartSeries = [];
$currDate = clone $startDate;
while ($currDate <= $endDate) {
    $dStr = $currDate->format('Y-m-d');
    if (isset($chartMap[$dStr])) {
        $chartSeries[] = $chartMap[$dStr];
    } else {
        $chartSeries[] = [
            'date' => $dStr,
            'revenue' => 0.00,
            'orders' => 0
        ];
    }
    $currDate->modify('+1 day');
}

// 4. Best-Selling Products (Ranked by units sold in period)
$bestSellersStmt = $db->prepare("
    SELECT
        oi.product_id,
        oi.product_name,
        oi.brand_name,
        COALESCE(p.image, '') AS image,
        COALESCE(p.inventory_qty, 0) AS current_stock,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.line_total) AS total_sales
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.order_status != 'cancelled'
      AND o.created_at BETWEEN ? AND ?
    GROUP BY oi.product_id, oi.product_name, oi.brand_name, p.image, p.inventory_qty
    ORDER BY units_sold DESC, total_sales DESC
    LIMIT 10
");
$bestSellersStmt->execute([$sDate, $eDate]);
$bestSellers = $bestSellersStmt->fetchAll();

foreach ($bestSellers as &$bs) {
    $bs['units_sold'] = (int)$bs['units_sold'];
    $bs['total_sales'] = (float)$bs['total_sales'];
    $bs['current_stock'] = (int)$bs['current_stock'];
}
unset($bs);

// 5. Orders by Status
$statusStmt = $db->prepare("
    SELECT order_status, COUNT(id) AS cnt
    FROM orders
    WHERE created_at BETWEEN ? AND ?
    GROUP BY order_status
");
$statusStmt->execute([$sDate, $eDate]);
$statusRows = $statusStmt->fetchAll();

$ordersByStatus = [
    'pending' => 0,
    'confirmed' => 0,
    'processing' => 0,
    'shipped' => 0,
    'delivered' => 0,
    'cancelled' => 0
];
foreach ($statusRows as $sRow) {
    if (isset($ordersByStatus[$sRow['order_status']])) {
        $ordersByStatus[$sRow['order_status']] = (int)$sRow['cnt'];
    }
}

// 6. Low Stock Products Warning
$lowStockStmt = $db->prepare("
    SELECT id, name, brand, image, inventory_qty, low_stock_threshold
    FROM products
    WHERE status = 'published' AND inventory_qty <= low_stock_threshold
    ORDER BY inventory_qty ASC
    LIMIT 10
");
$lowStockStmt->execute();
$lowStockProducts = $lowStockStmt->fetchAll();

// 7. Category Performance
$categoryStmt = $db->prepare("
    SELECT
        COALESCE(p.category, 'Uncategorized') AS category_name,
        SUM(oi.quantity) AS total_units,
        SUM(oi.line_total) AS total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.order_status != 'cancelled'
      AND o.created_at BETWEEN ? AND ?
    GROUP BY p.category
    ORDER BY total_revenue DESC
");
$categoryStmt->execute([$sDate, $eDate]);
$categoryPerformance = $categoryStmt->fetchAll();

foreach ($categoryPerformance as &$cp) {
    $cp['total_units'] = (int)$cp['total_units'];
    $cp['total_revenue'] = (float)$cp['total_revenue'];
}
unset($cp);

// Respond with complete analytics payload
jsonResponse([
    'period' => $period,
    'start_date' => $sDate,
    'end_date' => $eDate,
    'summary' => [
        'revenue' => [
            'value' => $totalRevenue,
            'prev' => $prevRevenue,
            'change_pct' => $prevRevenue > 0 ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1) : null
        ],
        'orders' => [
            'value' => $totalOrders,
            'prev' => $prevOrders,
            'change_pct' => $prevOrders > 0 ? round((($totalOrders - $prevOrders) / $prevOrders) * 100, 1) : null
        ],
        'units_sold' => [
            'value' => $totalUnits,
            'prev' => $prevUnits,
            'change_pct' => $prevUnits > 0 ? round((($totalUnits - $prevUnits) / $prevUnits) * 100, 1) : null
        ],
        'aov' => [
            'value' => $aov,
            'prev' => $prevAov,
            'change_pct' => $prevAov > 0 ? round((($aov - $prevAov) / $prevAov) * 100, 1) : null
        ],
        'customers' => [
            'value' => $totalCustomers,
            'prev' => $prevCustomers,
            'change_pct' => $prevCustomers > 0 ? round((($totalCustomers - $prevCustomers) / $prevCustomers) * 100, 1) : null
        ],
        'pending_orders' => [
            'value' => $pendingOrders
        ]
    ],
    'revenue_chart' => $chartSeries,
    'best_sellers' => $bestSellers,
    'orders_by_status' => $ordersByStatus,
    'low_stock' => $lowStockProducts,
    'category_performance' => $categoryPerformance
], 200);
