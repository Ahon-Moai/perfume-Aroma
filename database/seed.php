<?php
/**
 * Database Seed Script
 */

require_once __DIR__ . '/../api/config/config.php';
require_once __DIR__ . '/../api/db.php';

echo "1. Connecting to DB...\n";
$db = Database::getConnection();
$config = require __DIR__ . '/../api/config/config.php';
$isSqlite = ($config['db']['driver'] === 'sqlite');

echo "2. Loading Schema...\n";
$schemaSql = file_get_contents(__DIR__ . '/schema.sql');

if ($isSqlite) {
    $schemaSql = preg_replace('/`id` INT AUTO_INCREMENT PRIMARY KEY/i', '`id` INTEGER PRIMARY KEY AUTOINCREMENT', $schemaSql);
    $schemaSql = preg_replace('/ENGINE=InnoDB[^\n;]*/i', '', $schemaSql);
    $schemaSql = preg_replace('/COLLATE=[^\n;]*/i', '', $schemaSql);
    $schemaSql = preg_replace('/ENUM\([^)]+\)/i', 'TEXT', $schemaSql);
    $schemaSql = preg_replace('/LONGTEXT/i', 'TEXT', $schemaSql);
    $schemaSql = preg_replace('/ON UPDATE CURRENT_TIMESTAMP/i', '', $schemaSql);
}

$statements = array_filter(array_map('trim', explode(';', $schemaSql)));
foreach ($statements as $stmt) {
    if (!empty($stmt)) {
        try {
            $db->exec($stmt);
        } catch (\PDOException $e) {
            // ignore
        }
    }
}

echo "3. Schema tables created.\n";

$defaultSettings = [
    'store_name' => 'AROMATICA ONE',
    'tagline' => 'Signature Decants Edition by ARRINA ATELIER',
    'contact_phone' => '+880 1700-000000',
    'contact_email' => 'concierge@aromatica.com.bd',
    'address' => 'Banani High Street, Block 11, Dhaka 1213, Bangladesh',
    'currency' => 'BDT',
    'currency_symbol' => '৳',
    'shipping_fee_dhaka' => '70',
    'shipping_fee_outside_dhaka' => '130',
    'free_shipping_threshold' => '3000',
    'enable_cod' => '1',
    'enable_bkash' => '1',
    'enable_nagad' => '1',
    'enable_card' => '1',
    'announcement_bar' => 'AUTHENTIC LUXURY DECANTS · FREE NATIONWIDE SHIPPING OVER ৳ 3,000'
];

foreach ($defaultSettings as $key => $val) {
    if ($isSqlite) {
        $stmtSetting = $db->prepare("INSERT INTO store_settings (setting_key, setting_value) VALUES (:key, :value) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value");
        $stmtSetting->execute([':key' => $key, ':value' => $val]);
    } else {
        $stmt = $db->prepare("INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        $stmt->execute([$key, $val]);
    }
}

echo "4. Settings inserted.\n";

$adminUsername = 'admin';
$adminEmail = 'admin@aromatica.com.bd';
$adminPass = 'admin123';
$hash = password_hash($adminPass, PASSWORD_BCRYPT);

$db->exec("DELETE FROM admin_users WHERE username = 'admin'");
$stmtAdmin = $db->prepare("INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, 'admin')");
$stmtAdmin->execute([$adminUsername, $adminEmail, $hash]);

echo "5. Admin account created.\n";

$products = [
  [
    'id' => 'prod-pure-portions',
    'brand' => 'ARRINA',
    'name' => 'Pure Portions (5ml Atomizer)',
    'category' => 'Solar Floral Amber',
    'gender' => 'Unisex',
    'concentration' => 'Extrait de Parfum',
    'starting_price' => 490,
    'image' => '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
    'additional_images' => [
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg',
      '/src/assets/images/studio_social_amber_spray_1791908204588.jpg'
    ],
    'notes' => json_encode(['Neroli Blossom', 'Madagascar Bourbon Vanilla', 'Golden Amber Crystals', 'Solar Dew']),
    'short_description' => 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity.',
    'description' => 'Pure Portions is ARRINA ATELIER\'s hallmark decant edition. Encased in high-clarity Italian glass tubes with precision fine-mist dispersion nozzles.',
    'sizes' => [
      ['size' => '5ml', 'price' => 490],
      ['size' => '10ml (2x5ml)', 'price' => 920],
      ['size' => '15ml Boxed Set', 'price' => 1350]
    ]
  ],
  [
    'id' => 'prod-rose01',
    'brand' => 'SWISS ARABIAN',
    'name' => 'Rose 01',
    'category' => 'Floral',
    'gender' => 'Her',
    'concentration' => 'Eau de Parfum',
    'starting_price' => 661,
    'image' => '/src/assets/images/perfume_rose01_1791908158391.jpg',
    'additional_images' => [
      '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
      '/src/assets/images/campaign_for_her_1791908163547.jpg',
      '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'
    ],
    'notes' => json_encode(['Damask Rose', 'Pink Peppercorn', 'Cashmeran', 'White Musk']),
    'short_description' => 'A captivating bouquet of velvet damask roses wrapped in soft musk.',
    'description' => 'Rose 01 by Swiss Arabian combines delicate pink peppercorns with luminous rose petals.',
    'sizes' => [
      ['size' => '3ml', 'price' => 661],
      ['size' => '5ml', 'price' => 990],
      ['size' => '9ml', 'price' => 1650],
      ['size' => '15ml', 'price' => 2580]
    ]
  ],
  [
    'id' => 'prod-vanilla01',
    'brand' => 'SWISS ARABIAN',
    'name' => 'Vanilla 01',
    'category' => 'Gourmand',
    'gender' => 'Unisex',
    'concentration' => 'Eau de Parfum',
    'starting_price' => 661,
    'image' => '/src/assets/images/perfume_vanilla01_1791908158466.jpg',
    'additional_images' => [
      '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
      '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg'
    ],
    'notes' => json_encode(['Madagascar Bourbon Vanilla', 'Ambergris', 'Brown Sugar', 'Tonka']),
    'short_description' => 'Rich, sun-cured vanilla bean infused with golden ambergris.',
    'description' => 'Warm, comforting and velvety dark vanilla blend crafted for lingering warmth.',
    'sizes' => [
      ['size' => '3ml', 'price' => 661],
      ['size' => '5ml', 'price' => 990],
      ['size' => '9ml', 'price' => 1650],
      ['size' => '15ml', 'price' => 2580]
    ]
  ],
  [
    'id' => 'prod-genesis-leo',
    'brand' => 'FRENCH AVENUE',
    'name' => 'Genesis Leo',
    'category' => 'Woody Oriental',
    'gender' => 'Him',
    'concentration' => 'Extrait de Parfum',
    'starting_price' => 302,
    'image' => '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
    'additional_images' => [
      '/src/assets/images/campaign_for_him_1791908163466.jpg',
      '/src/assets/images/season_dark_forest_1791908203381.jpg'
    ],
    'notes' => json_encode(['Royal Oud', 'Saffron', 'Smoked Birch', 'Leather']),
    'short_description' => 'Regal smoked oud laced with spicy saffron and dark leather.',
    'description' => 'Genesis Leo delivers intense projection and masculine luxury.',
    'sizes' => [
      ['size' => '3ml', 'price' => 302],
      ['size' => '5ml', 'price' => 470],
      ['size' => '9ml', 'price' => 790],
      ['size' => '15ml', 'price' => 1250]
    ]
  ],
  [
    'id' => 'prod-venena',
    'brand' => 'FRENCH AVENUE',
    'name' => 'Venena',
    'category' => 'Spicy Amber',
    'gender' => 'Him',
    'concentration' => 'Eau de Parfum',
    'starting_price' => 411,
    'image' => '/src/assets/images/perfume_venena_1791908161282.jpg',
    'additional_images' => [
      '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
      '/src/assets/images/studio_social_travertine_1791908203434.jpg'
    ],
    'notes' => json_encode(['Black Plum', 'Cardamom', 'Dark Tobacco', 'Incense']),
    'short_description' => 'Dark cardamom and sweet black plum over smoldering incense.',
    'description' => 'An enigmatic evening fragrance designed for bold presence.',
    'sizes' => [
      ['size' => '3ml', 'price' => 411],
      ['size' => '5ml', 'price' => 640],
      ['size' => '9ml', 'price' => 1080],
      ['size' => '15ml', 'price' => 1690]
    ]
  ],
  [
    'id' => 'prod-asdaaf-raneen',
    'brand' => 'ASDAAF',
    'name' => 'Raneen',
    'category' => 'Floral Amber',
    'gender' => 'Her',
    'concentration' => 'Eau de Parfum',
    'starting_price' => 336,
    'image' => '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg',
    'additional_images' => [
      '/src/assets/images/studio_social_hand_decant_1791908204628.jpg',
      '/src/assets/images/hero_perfume_architectural_1791908158566.jpg'
    ],
    'notes' => json_encode(['Orange Blossom', 'Praline', 'White Jasmine', 'Sweet Vanilla']),
    'short_description' => 'Sweet orange blossom and praline drizzled with jasmine nectar.',
    'description' => 'Raneen is a joyful floral amber fragrance with delicious gourmand facets.',
    'sizes' => [
      ['size' => '3ml', 'price' => 336],
      ['size' => '5ml', 'price' => 520],
      ['size' => '9ml', 'price' => 880],
      ['size' => '15ml', 'price' => 1390]
    ]
  ]
];

$stmtProd = $db->prepare("INSERT INTO products (id, brand, name, slug, category, gender, concentration, starting_price, short_description, description, image, notes, status, inventory_qty, is_featured, is_new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 100, 1, 1)");
$stmtVar = $db->prepare("INSERT INTO product_variants (id, product_id, size, price, stock_qty) VALUES (?, ?, ?, ?, 100)");
$stmtImg = $db->prepare("INSERT INTO product_images (product_id, image_path, display_order, is_primary) VALUES (?, ?, ?, ?)");

foreach ($products as $p) {
    $db->exec("DELETE FROM product_images WHERE product_id = " . $db->quote($p['id']));
    $db->exec("DELETE FROM product_variants WHERE product_id = " . $db->quote($p['id']));
    $db->exec("DELETE FROM products WHERE id = " . $db->quote($p['id']));

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $p['name'])));
    $stmtProd->execute([
        $p['id'],
        $p['brand'],
        $p['name'],
        $slug,
        $p['category'],
        $p['gender'],
        $p['concentration'],
        $p['starting_price'],
        $p['short_description'],
        $p['description'],
        $p['image'],
        $p['notes']
    ]);

    foreach ($p['sizes'] as $idx => $s) {
        $varId = $p['id'] . '-var-' . ($idx + 1);
        $stmtVar->execute([$varId, $p['id'], $s['size'], $s['price']]);
    }

    if (!empty($p['additional_images'])) {
        foreach ($p['additional_images'] as $order => $imgPath) {
            $stmtImg->execute([$p['id'], $imgPath, $order + 1, 0]);
        }
    }
}

echo "6. Products seeded.\n";

$brandsList = [
  ['HERRERA', false], ['ARMAF', true], ['DOLCE & GABBANA', false],
  ['LATTAFA', true], ['GIORGIO ARMANI', false], ['CALVIN KLEIN', true],
  ['CHANEL', false], ['RIFFS', false], ['DAVIDOFF', false],
  ['CREED', false], ['AHMED', false]
];

$db->exec("DELETE FROM brands");
$stmtBrand = $db->prepare("INSERT INTO brands (name, slug, is_new) VALUES (?, ?, ?)");
foreach ($brandsList as $b) {
    $bSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $b[0])));
    $stmtBrand->execute([$b[0], $bSlug, $b[1] ? 1 : 0]);
}

$reviewsList = [
  [
    'rev-1',
    '...and videos. It seemed to be an existing fetched the ...ng more from...',
    '...and videos. It seemed to be an existing fetched the original blend without any evaporation or adulteration. Ordering more from here next week.',
    'Tahmidur Rahman',
    5,
    1
  ],
  [
    'rev-2',
    '"Best in business. Absolute class."',
    'Best in business. Absolute class. Packaging was bulletproof, and the 5ml spray atomizers give the exact same fine mist dispersion as a full retail bottle.',
    'Jubayer Islam Bhuiyan',
    5,
    1
  ],
  [
    'rev-3',
    'Very wide range of products...',
    'Very wide range of products, bottle designs, perfume authenticity, customer service, everything is high quality 💯 Top notch. The customer service is also especially excellent, they are very responsive and also answers and provides your needs/enquiries well. 👌',
    'Faiyaz Masud',
    5,
    1
  ],
  [
    'rev-4',
    'Great packaging, great decants...',
    'Great packaging, great decants, highly recommend! Even came with protective shrink seals on each glass tube.',
    'Samiul Masuk Dihan',
    5,
    1
  ]
];

$db->exec("DELETE FROM reviews");
$stmtRev = $db->prepare("INSERT INTO reviews (id, quote, content, author, rating, verified) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($reviewsList as $r) {
    $stmtRev->execute($r);
}

$faqsList = [
  ['faq-1', 'What is a decant?', 'A decant is a smaller atomizer that contains a portion of perfume from the original bottle. Decanting means transferring perfume from the main bottle into a smaller bottle. It allows you to test luxury scents on skin for several weeks without committing to full retail prices.'],
  ['faq-2', 'But I can just test at a perfume shop by sniffing?', 'Sniffing perfume on a paper strip in a boutique only reveals the volatile top notes (first 5-10 minutes). A decant lets you experience the true dry-down, skin chemistry, projection, and sillage over an entire day in your natural climate and routines.'],
  ['faq-3', 'Are the fragrances 100% Genuine?', 'Every milliliter is extracted directly from original brand flacons sourced from authorized European and Middle Eastern distributors. We never dilute, alter, or mix scents with carrier oils.'],
  ['faq-4', 'What is the shipping cost?', 'Standard door-to-door delivery inside Dhaka is BDT 70, and outside Dhaka nationwide is BDT 130. We offer free shipping on orders above BDT 3,000.'],
  ['faq-5', 'How long does shipping take?', 'Orders are freshly decanted within 24 hours of confirmation. Delivery within Dhaka takes 1-2 business days, and all other districts take 2-4 business days via verified express couriers.']
];

$db->exec("DELETE FROM faqs");
$stmtFaq = $db->prepare("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)");
foreach ($faqsList as $f) {
    $stmtFaq->execute($f);
}

$journalList = [
  [
    'art-1',
    "Don't Buy Decants From Us Before Reading This!",
    'FEB 01, 2026',
    'AROMATICA ONE',
    'Read this before you buy your first decant. Especially the part about why we genuinely cannot guarantee longevity, and what factors actually control skin chemistry...',
    '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg'
  ],
  [
    'art-2',
    'Why Did You Mix Water With My Decant?',
    'FEB 01, 2026',
    'AROMATICA ONE',
    'Weak fragrance does not mean fake decant. Here is what is actually going on, and what you can do about maceration, temperature shock, and olfactory fatigue.',
    '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'
  ],
  [
    'art-3',
    'Hidden Reality Of Our Pricing!',
    'FEB 01, 2026',
    'AROMATICA ONE',
    'Our pricing is not just random numbers. Here is the full, unvarnished math behind decant margins, high-pressure glass bottling, and genuine retail procurement.',
    '/src/assets/images/article_lilac_pricing_1791908274975.jpg'
  ]
];

$db->exec("DELETE FROM journal_articles");
$stmtArt = $db->prepare("INSERT INTO journal_articles (id, title, date, publisher, description, image) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($journalList as $a) {
    $stmtArt->execute($a);
}

$socialList = [
  ['soc-1', '@aromaticone', '/src/assets/images/studio_social_travertine_1791908203434.jpg', 223, 2, 'REALITY ≠ REVIEWS'],
  ['soc-2', '@aromaticone', '/src/assets/images/studio_social_hand_decant_1791908204628.jpg', 234, 1, 'AUTHENTIC DECANTS'],
  ['soc-3', '@aromaticone', '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg', 86, 8, 'AUTHENTIC DECANTS'],
  ['soc-4', '@aromaticone', '/src/assets/images/studio_social_amber_spray_1791908204588.jpg', 85, 5, 'STUDIO AROMA']
];

$db->exec("DELETE FROM social_cards");
$stmtSoc = $db->prepare("INSERT INTO social_cards (id, handle, image, likes, comments, tag) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($socialList as $s) {
    $stmtSoc->execute($s);
}

$homepageSections = [
  [
    'section_key' => 'hero',
    'title' => 'LUXURY, BY THE ML',
    'subtitle' => 'THE SIGNATURE DECANTS EDITION · ARRINA ATELIER',
    'content_json' => json_encode([
      'headline' => 'LUXURY, BY THE ML',
      'tagline' => 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.',
      'specifier' => '5 ML ( 75+ SPRAYS )',
      'primary_cta_text' => 'ORDER PURE PORTIONS · ৳ 490',
      'secondary_cta_text' => 'EXPLORE ALL DECANTS',
      'image' => '/src/assets/images/hero_pure_portions_arrina_1791911761493.jpg'
    ]),
    'display_order' => 1
  ],
  [
    'section_key' => 'category_marquee',
    'title' => 'Category Marquee',
    'subtitle' => '',
    'content_json' => json_encode([
      'items' => ['SOLAR FLORAL AMBER', 'EXOTIC OUD & WOODS', 'GOURMAND VANILLA', 'FRESH CITRUS & SPICE']
    ]),
    'display_order' => 2
  ],
  [
    'section_key' => 'video_showcase',
    'title' => 'AURA & SILLAGE IN MOTION',
    'subtitle' => 'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.',
    'content_json' => json_encode([
      'headline' => 'AURA & SILLAGE IN MOTION',
      'tagline' => 'Weightless liquid gold suspended in high-pressure glass atomizers. Experience the delicate art of artisanal decanting.',
      'badge_text' => 'ARRINA CINEMATIC ATELIER',
      'is_enabled' => true,
      'cards' => [
        [
          'id' => 'card-1',
          'product_id' => 'prod-pure-portions',
          'title' => 'Pure Portions (5ml)',
          'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-dark-background-41527-large.mp4',
          'thumbnail_url' => '/src/assets/images/element_pure_portions_bottle_1791911761493.jpg',
          'display_order' => 1,
          'is_enabled' => true
        ],
        [
          'id' => 'card-2',
          'product_id' => 'prod-rose01',
          'title' => 'Rose 01',
          'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-bottle-of-perfume-41528-large.mp4',
          'thumbnail_url' => '/src/assets/images/perfume_rose01_1791908158391.jpg',
          'display_order' => 2,
          'is_enabled' => true
        ],
        [
          'id' => 'card-3',
          'product_id' => 'prod-vanilla01',
          'title' => 'Vanilla 01',
          'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-hands-spraying-perfume-on-a-wrist-41529-large.mp4',
          'thumbnail_url' => '/src/assets/images/perfume_vanilla01_1791908158466.jpg',
          'display_order' => 3,
          'is_enabled' => true
        ],
        [
          'id' => 'card-4',
          'product_id' => 'prod-genesis-leo',
          'title' => 'Genesis Leo',
          'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-drop-of-water-falling-into-a-liquid-surface-41526-large.mp4',
          'thumbnail_url' => '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
          'display_order' => 4,
          'is_enabled' => true
        ]
      ]
    ]),
    'display_order' => 3
  ],
  [
    'section_key' => 'custom_section_1',
    'title' => 'MOST LOVED DECANTS',
    'subtitle' => 'CURATED BESTSELLERS FOR DISCOVERING YOUR SIGNATURE SCENT',
    'content_json' => json_encode([
      'is_enabled' => true,
      'product_ids' => ['prod-pure-portions', 'prod-vanilla01', 'prod-rose01']
    ]),
    'display_order' => 4
  ],
  [
    'section_key' => 'custom_section_2',
    'title' => 'ORIENTAL & OUD SELECTIONS',
    'subtitle' => 'DEEP, SMOKY & REFINED RESINS',
    'content_json' => json_encode([
      'is_enabled' => true,
      'product_ids' => ['prod-genesis-leo', 'prod-venena']
    ]),
    'display_order' => 5
  ],
  [
    'section_key' => 'custom_section_3',
    'title' => 'FLORAL & AMBER ESSENCES',
    'subtitle' => 'RADIANT VELVET PETALS & SOLAR DEW',
    'content_json' => json_encode([
      'is_enabled' => true,
      'product_ids' => ['prod-asdaaf-raneen', 'prod-rose01']
    ]),
    'display_order' => 6
  ],
  [
    'section_key' => 'custom_section_4',
    'title' => 'LIMITED VAULT EDITIONS',
    'subtitle' => 'EXCLUSIVE BATCH ALLOCATIONS',
    'content_json' => json_encode([
      'is_enabled' => true,
      'product_ids' => ['prod-vanilla01', 'prod-genesis-leo', 'prod-pure-portions']
    ]),
    'display_order' => 7
  ]
];

foreach ($homepageSections as $sec) {
    if ($isSqlite) {
        $stmtSec = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order) VALUES (:key, :title, :subtitle, :json, :order) ON CONFLICT(section_key) DO UPDATE SET title=excluded.title, content_json=excluded.content_json");
        $stmtSec->execute([
            ':key' => $sec['section_key'],
            ':title' => $sec['title'],
            ':subtitle' => $sec['subtitle'],
            ':json' => $sec['content_json'],
            ':order' => $sec['display_order']
        ]);
    } else {
        $stmt = $db->prepare("INSERT INTO homepage_sections (section_key, title, subtitle, content_json, display_order) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), content_json=VALUES(content_json)");
        $stmt->execute([$sec['section_key'], $sec['title'], $sec['subtitle'], $sec['content_json'], $sec['display_order']]);
    }
}

try {
    if ($isSqlite) {
        $db->exec("INSERT INTO coupons (code, discount_type, discount_value, min_spend) VALUES ('WELCOME10', 'percent', 10.00, 1000.00) ON CONFLICT(code) DO NOTHING");
    } else {
        $db->exec("INSERT INTO coupons (code, discount_type, discount_value, min_spend) VALUES ('WELCOME10', 'percent', 10.00, 1000.00) ON DUPLICATE KEY UPDATE code=code");
    }
} catch (\PDOException $e) {
    // Ignore duplicate
}

echo "7. Database Seeding Completed Successfully!\n";
