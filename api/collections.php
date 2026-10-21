<?php
/**
 * Public Collections REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    jsonError('Method not allowed', 405);
}

$slug = sanitizeString($_GET['slug'] ?? null);
$id = sanitizeString($_GET['id'] ?? null);

if ($slug || $id) {
    if ($slug) {
        $stmt = $db->prepare("SELECT * FROM collections WHERE (slug = ? OR LOWER(title) = ? OR LOWER(rule_value) = ?) AND is_enabled = 1 LIMIT 1");
        $stmt->execute([$slug, strtolower(str_replace('-', ' ', $slug)), strtolower($slug)]);
    } else {
        $stmt = $db->prepare("SELECT * FROM collections WHERE id = ? AND is_enabled = 1 LIMIT 1");
        $stmt->execute([$id]);
    }

    $col = $stmt->fetch();

    // Fallback for dynamically matching common slugs if not in table
    if (!$col && $slug) {
        $cleanSlug = strtolower(trim($slug));
        if ($cleanSlug === 'all') {
            $col = [
                'id' => 'col-all',
                'title' => 'All Fragrances',
                'slug' => 'all',
                'description' => 'Explore our complete catalogue of authentic luxury decants extracted directly from brand flacons.',
                'image' => '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
                'rule_type' => 'all',
                'rule_value' => ''
            ];
        } elseif (in_array($cleanSlug, ['forhim', 'for-him', 'him', 'men'])) {
            $col = [
                'id' => 'col-forhim',
                'title' => 'For Him',
                'slug' => 'forhim',
                'description' => 'Bold smoked woods, spicy saffron, regal oud, and dark masculine resins.',
                'image' => '/src/assets/images/campaign_for_him_1791908163466.jpg',
                'rule_type' => 'gender',
                'rule_value' => 'Him'
            ];
        } elseif (in_array($cleanSlug, ['forher', 'for-her', 'her', 'women'])) {
            $col = [
                'id' => 'col-forher',
                'title' => 'For Her',
                'slug' => 'forher',
                'description' => 'Luminous damask rose, velvet petals, white musk, and enchanting gourmand sillage.',
                'image' => '/src/assets/images/campaign_for_her_1791908163547.jpg',
                'rule_type' => 'gender',
                'rule_value' => 'Her'
            ];
        } elseif (in_array($cleanSlug, ['unisex', 'shared'])) {
            $col = [
                'id' => 'col-unisex',
                'title' => 'Unisex Decants',
                'slug' => 'unisex',
                'description' => 'Versatile solar amber, cured Madagascar vanilla, and balanced artisanal fragrances designed for everyone.',
                'image' => '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
                'rule_type' => 'gender',
                'rule_value' => 'Unisex'
            ];
        } elseif (in_array($cleanSlug, ['best-sellers', 'bestsellers', 'best-seller', 'popular'])) {
            $col = [
                'id' => 'col-bestsellers',
                'title' => 'Best Sellers',
                'slug' => 'best-sellers',
                'description' => 'Our most sought-after signature decants and viral fragrance allocations.',
                'image' => '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg',
                'rule_type' => 'featured',
                'rule_value' => ''
            ];
        } elseif (in_array($cleanSlug, ['new-arrivals', 'newarrivals', 'new-arrival', 'new'])) {
            $col = [
                'id' => 'col-newarrivals',
                'title' => 'New Arrivals',
                'slug' => 'new-arrivals',
                'description' => 'Freshly decanted atelier releases and latest Middle Eastern & European arrivals.',
                'image' => '/src/assets/images/perfume_rose01_1791908158391.jpg',
                'rule_type' => 'new_arrival',
                'rule_value' => ''
            ];
        } else {
            // Generic rule category match
            $col = [
                'id' => 'col-' . $cleanSlug,
                'title' => ucwords(str_replace('-', ' ', $cleanSlug)),
                'slug' => $cleanSlug,
                'description' => 'Curated collection of ' . ucwords(str_replace('-', ' ', $cleanSlug)) . ' decants.',
                'image' => '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
                'rule_type' => 'category',
                'rule_value' => ucwords(str_replace('-', ' ', $cleanSlug))
            ];
        }
    }

    if (!$col) {
        jsonError('Collection not found', 404);
    }

    jsonResponse($col, 200);
}

// Fetch all collections
$stmt = $db->query("SELECT * FROM collections WHERE is_enabled = 1 ORDER BY display_order ASC, title ASC");
$collections = $stmt->fetchAll();

jsonResponse($collections, 200);
