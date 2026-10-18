<?php
/**
 * Admin Homepage CMS REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$config = require __DIR__ . '/../config/config.php';
$isSqlite = ($config['db']['driver'] === 'sqlite');

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM homepage_sections ORDER BY display_order ASC");
    $sectionsRaw = $stmt->fetchAll();

    $sections = [];
    foreach ($sectionsRaw as $sec) {
        $sec['content'] = json_decode($sec['content_json'], true);
        $sections[$sec['section_key']] = $sec;
    }

    $faqs = $db->query("SELECT id, question, answer, display_order FROM faqs ORDER BY display_order ASC")->fetchAll();
    $reviews = $db->query("SELECT id, quote, content, author, rating, verified, display_order FROM reviews ORDER BY display_order ASC")->fetchAll();
    $articles = $db->query("SELECT id, title, date, publisher, description, image, display_order FROM journal_articles ORDER BY display_order ASC")->fetchAll();
    $socialCards = $db->query("SELECT id, handle, image, likes, comments, tag, display_order FROM social_cards ORDER BY display_order ASC")->fetchAll();

    jsonResponse([
        'sections' => $sections,
        'faqs' => $faqs,
        'reviews' => $reviews,
        'articles' => $articles,
        'socialCards' => $socialCards
    ], 200);

} elseif ($method === 'PUT' || $method === 'POST') {
    $input = getJsonInput();
    $type = $input['type'] ?? $input['entity'] ?? 'section';

    if ($type === 'faq') {
        $id = sanitizeString($input['id'] ?? 'faq-' . time());
        $question = sanitizeString($input['question'] ?? '');
        $answer = sanitizeString($input['answer'] ?? '');
        $order = (int)($input['display_order'] ?? 0);

        if ($isSqlite) {
            $stmt = $db->prepare("INSERT INTO faqs (id, question, answer, display_order, is_published) VALUES (:id, :q, :a, :order, 1) ON CONFLICT(id) DO UPDATE SET question=excluded.question, answer=excluded.answer, display_order=excluded.display_order, is_published=1");
            $stmt->execute([':id' => $id, ':q' => $question, ':a' => $answer, ':order' => $order]);
        } else {
            $stmt = $db->prepare("INSERT INTO faqs (id, question, answer, display_order, is_published) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE question=VALUES(question), answer=VALUES(answer), display_order=VALUES(display_order), is_published=1");
            $stmt->execute([$id, $question, $answer, $order]);
        }
        jsonResponse(null, 200, "FAQ saved successfully");

    } elseif ($type === 'review') {
        $id = sanitizeString($input['id'] ?? 'rev-' . time());
        $quote = sanitizeString($input['quote'] ?? '');
        $content = sanitizeString($input['content'] ?? '');
        $author = sanitizeString($input['author'] ?? '');
        $rating = (int)($input['rating'] ?? 5);

        if ($isSqlite) {
            $stmt = $db->prepare("INSERT INTO reviews (id, quote, content, author, rating, is_published) VALUES (:id, :q, :c, :a, :r, 1) ON CONFLICT(id) DO UPDATE SET quote=excluded.quote, content=excluded.content, author=excluded.author, rating=excluded.rating, is_published=1");
            $stmt->execute([':id' => $id, ':q' => $quote, ':c' => $content, ':a' => $author, ':r' => $rating]);
        } else {
            $stmt = $db->prepare("INSERT INTO reviews (id, quote, content, author, rating, is_published) VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE quote=VALUES(quote), content=VALUES(content), author=VALUES(author), rating=VALUES(rating), is_published=1");
            $stmt->execute([$id, $quote, $content, $author, $rating]);
        }
        jsonResponse(null, 200, "Review saved successfully");

    } elseif ($type === 'article') {
        $id = sanitizeString($input['id'] ?? 'art-' . time());
        $title = sanitizeString($input['title'] ?? '');
        $date = sanitizeString($input['date'] ?? date('M d, Y'));
        $publisher = sanitizeString($input['publisher'] ?? 'AROMATICA ONE');
        $desc = sanitizeString($input['description'] ?? '');
        $image = sanitizeString($input['image'] ?? '');

        if ($isSqlite) {
            $stmt = $db->prepare("INSERT INTO journal_articles (id, title, date, publisher, description, image, is_published) VALUES (:id, :t, :d, :p, :desc, :img, 1) ON CONFLICT(id) DO UPDATE SET title=excluded.title, date=excluded.date, publisher=excluded.publisher, description=excluded.description, image=excluded.image, is_published=1");
            $stmt->execute([':id' => $id, ':t' => $title, ':d' => $date, ':p' => $publisher, ':desc' => $desc, ':img' => $image]);
        } else {
            $stmt = $db->prepare("INSERT INTO journal_articles (id, title, date, publisher, description, image, is_published) VALUES (?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE title=VALUES(title), date=VALUES(date), publisher=VALUES(publisher), description=VALUES(description), image=VALUES(image), is_published=1");
            $stmt->execute([$id, $title, $date, $publisher, $desc, $image]);
        }
        jsonResponse(null, 200, "Article saved successfully");

    } else {
        // Default homepage section update (e.g. hero, category_marquee)
        $sectionKey = sanitizeString($input['section_key'] ?? $input['sectionKey'] ?? null);
        if (!$sectionKey) {
            jsonError('Section key is required', 400);
        }

        $title = sanitizeString($input['title'] ?? '');
        $subtitle = sanitizeString($input['subtitle'] ?? '');
        $isEnabled = isset($input['is_enabled']) ? ($input['is_enabled'] ? 1 : 0) : 1;
        $displayOrder = (int)($input['display_order'] ?? 0);
        $content = is_array($input['content'] ?? null) ? json_encode($input['content']) : json_encode([]);

        if ($isSqlite) {
            $stmt = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order, is_enabled) VALUES (:key, :title, :subtitle, :json, :order, :enabled) ON CONFLICT(section_key) DO UPDATE SET title=excluded.title, subtitle=excluded.subtitle, content_json=excluded.content_json, is_enabled=excluded.is_enabled, display_order=excluded.display_order");
            $stmt->execute([
                ':key' => $sectionKey,
                ':title' => $title,
                ':subtitle' => $subtitle,
                ':json' => $content,
                ':order' => $displayOrder,
                ':enabled' => $isEnabled
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order, is_enabled) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), content_json=VALUES(content_json), is_enabled=VALUES(is_enabled), display_order=VALUES(display_order)");
            $stmt->execute([$sectionKey, $title, $subtitle, $content, $displayOrder, $isEnabled]);
        }

        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'update_homepage_section', 'homepage_sections', ?, ?)");
        $logStmt->execute([$admin['id'], $sectionKey, "Updated section $sectionKey"]);

        jsonResponse(null, 200, "Section $sectionKey updated successfully");
    }

} elseif ($method === 'DELETE') {
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);
    $type = sanitizeString($_GET['type'] ?? $input['type'] ?? null);

    if ($id && $type) {
        if ($type === 'faq') {
            $stmt = $db->prepare("DELETE FROM faqs WHERE id = ?");
            $stmt->execute([$id]);
        } elseif ($type === 'review') {
            $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
            $stmt->execute([$id]);
        } elseif ($type === 'article') {
            $stmt = $db->prepare("DELETE FROM journal_articles WHERE id = ?");
            $stmt->execute([$id]);
        }
        jsonResponse(null, 200, "Deleted $type successfully");
    }
    jsonError('Missing id or type for deletion', 400);
} else {
    jsonError('Method not allowed', 405);
}
