<?php
/**
 * Public Homepage Sections REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    jsonError('Method not allowed', 405);
}

// Fetch all enabled homepage sections ordered by display_order
$stmt = $db->query("SELECT section_key, title, subtitle, content_json, display_order FROM homepage_sections WHERE is_enabled = 1 ORDER BY display_order ASC");
$sectionsRaw = $stmt->fetchAll();

$sections = [];
foreach ($sectionsRaw as $sec) {
    $sections[$sec['section_key']] = [
        'title' => $sec['title'],
        'subtitle' => $sec['subtitle'],
        'content' => json_decode($sec['content_json'], true)
    ];
}

// Fetch reviews
$revStmt = $db->query("SELECT id, quote, content, author, rating, verified FROM reviews WHERE is_published = 1 ORDER BY display_order ASC");
$reviews = $revStmt->fetchAll();

// Fetch FAQs
$faqStmt = $db->query("SELECT id, question, answer FROM faqs WHERE is_published = 1 ORDER BY display_order ASC");
$faqs = $faqStmt->fetchAll();

// Fetch Journal Articles
$artStmt = $db->query("SELECT id, title, date, publisher, description, image FROM journal_articles WHERE is_published = 1 ORDER BY display_order ASC");
$articles = $artStmt->fetchAll();

// Fetch Social Cards
$socStmt = $db->query("SELECT id, handle, image, likes, comments, tag FROM social_cards WHERE is_published = 1 ORDER BY display_order ASC");
$socialCards = $socStmt->fetchAll();

// Fetch Brands
$brandStmt = $db->query("SELECT name, slug, is_new FROM brands ORDER BY id ASC");
$brands = array_map(function($b) {
    return ['name' => $b['name'], 'isNew' => (bool)$b['is_new']];
}, $brandStmt->fetchAll());

jsonResponse([
    'sections' => $sections,
    'reviews' => $reviews,
    'faqs' => $faqs,
    'articles' => $articles,
    'socialCards' => $socialCards,
    'brands' => $brands
], 200);
