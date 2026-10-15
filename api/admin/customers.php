<?php
/**
 * Admin Customers REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $search = $_GET['search'] ?? null;

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM customers WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $customer = $stmt->fetch();

        if (!$customer) {
            jsonError('Customer not found', 404);
        }

        $ordStmt = $db->prepare("SELECT id, order_number, subtotal, delivery_fee, total_amount, order_status, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC");
        $ordStmt->execute([$customer['id']]);
        $customer['orders'] = $ordStmt->fetchAll();

        jsonResponse($customer, 200);

    } else {
        $where = ["1=1"];
        $params = [];

        if ($search) {
            $where[] = "(name LIKE ? OR phone LIKE ? OR email LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereSql = implode(' AND ', $where);
        $sql = "SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as order_count, (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.customer_id = c.id AND o.order_status != 'cancelled') as total_spent FROM customers c WHERE $whereSql ORDER BY c.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $customers = $stmt->fetchAll();

        jsonResponse($customers, 200);
    }

} else {
    jsonError('Method not allowed', 405);
}
