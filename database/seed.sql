-- AROMATICA CMS - MariaDB/MySQL Seed Data File
-- For cPanel phpMyAdmin Import

-- 1. Store Settings
INSERT INTO `store_settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'AROMATICA ONE'),
('tagline', 'Signature Decants Edition by ARRINA ATELIER'),
('contact_phone', '+880 1700-000000'),
('contact_email', 'concierge@aromatica.com.bd'),
('address', 'Banani High Street, Block 11, Dhaka 1213, Bangladesh'),
('currency', 'BDT'),
('currency_symbol', '৳'),
('shipping_fee_dhaka', '70'),
('shipping_fee_outside_dhaka', '130'),
('free_shipping_threshold', '3000'),
('enable_cod', '1'),
('enable_bkash', '1'),
('enable_nagad', '1'),
('enable_card', '1'),
('announcement_bar', 'AUTHENTIC LUXURY DECANTS · FREE NATIONWIDE SHIPPING OVER ৳ 3,000')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 2. Default Admin User (username: admin, password: admin123)
DELETE FROM `admin_users` WHERE `username` = 'admin';
INSERT INTO `admin_users` (`username`, `email`, `password_hash`, `role`) VALUES
('admin', 'admin@aromatica.com.bd', '$2y$10$8k1p/z9QGZ/4G/x.jB5E3.o49p/O75G/E5s.1b/s5Z5e5Z5e5Z5e5', 'admin');

-- 3. Products
DELETE FROM `products`;
INSERT INTO `products` (`id`, `brand`, `name`, `slug`, `category`, `gender`, `concentration`, `starting_price`, `short_description`, `description`, `image`, `notes`, `status`, `inventory_qty`, `is_featured`, `is_new_arrival`) VALUES
('prod-pure-portions', 'ARRINA', 'Pure Portions (5ml Atomizer)', 'pure-portions-5ml-atomizer', 'Solar Floral Amber', 'Unisex', 'Extrait de Parfum', 490.00, 'Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity.', 'Pure Portions is ARRINA ATELIER\'s hallmark decant edition. Sealed in glass with precision high-pressure spray head.', '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg', '["Neroli Blossom", "Madagascar Bourbon Vanilla", "Golden Amber Crystals", "Solar Dew"]', 'published', 100, 1, 1),
('prod-rose01', 'SWISS ARABIAN', 'Rose 01', 'rose-01', 'Floral', 'Her', 'Eau de Parfum', 661.00, 'A captivating bouquet of velvet damask roses wrapped in soft musk.', 'Rose 01 by Swiss Arabian combines delicate pink peppercorns with luminous rose petals.', '/src/assets/images/perfume_rose01_1791908158391.jpg', '["Damask Rose", "Pink Peppercorn", "Cashmeran", "White Musk"]', 'published', 100, 1, 1),
('prod-vanilla01', 'SWISS ARABIAN', 'Vanilla 01', 'vanilla-01', 'Gourmand', 'Unisex', 'Eau de Parfum', 661.00, 'Rich, sun-cured vanilla bean infused with golden ambergris.', 'Warm, comforting and velvety dark vanilla blend crafted for lingering warmth.', '/src/assets/images/perfume_vanilla01_1791908158466.jpg', '["Madagascar Bourbon Vanilla", "Ambergris", "Brown Sugar", "Tonka"]', 'published', 100, 1, 1),
('prod-genesis-leo', 'FRENCH AVENUE', 'Genesis Leo', 'genesis-leo', 'Woody Oriental', 'Him', 'Extrait de Parfum', 302.00, 'Regal smoked oud laced with spicy saffron and dark leather.', 'Genesis Leo delivers intense projection and masculine luxury.', '/src/assets/images/perfume_genesis_leo_1791908160379.jpg', '["Royal Oud", "Saffron", "Smoked Birch", "Leather"]', 'published', 100, 1, 1),
('prod-venena', 'FRENCH AVENUE', 'Venena', 'venena', 'Spicy Amber', 'Him', 'Eau de Parfum', 411.00, 'Dark cardamom and sweet black plum over smoldering incense.', 'An enigmatic evening fragrance designed for bold presence.', '/src/assets/images/perfume_venena_1791908161282.jpg', '["Black Plum", "Cardamom", "Dark Tobacco", "Incense"]', 'published', 100, 1, 1),
('prod-asdaaf-raneen', 'ASDAAF', 'Raneen', 'raneen', 'Floral Amber', 'Her', 'Eau de Parfum', 336.00, 'Sweet orange blossom and praline drizzled with jasmine nectar.', 'Raneen is a joyful floral amber fragrance with delicious gourmand facets.', '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg', '["Orange Blossom", "Praline", "White Jasmine", "Sweet Vanilla"]', 'published', 100, 1, 1);

-- 4. Product Variants (Decant Sizes)
DELETE FROM `product_variants`;
INSERT INTO `product_variants` (`id`, `product_id`, `size`, `price`, `stock_qty`) VALUES
('prod-pure-portions-var-1', 'prod-pure-portions', '5ml', 490.00, 100),
('prod-pure-portions-var-2', 'prod-pure-portions', '10ml (2x5ml)', 920.00, 100),
('prod-pure-portions-var-3', 'prod-pure-portions', '15ml Boxed Set', 1350.00, 100),
('prod-rose01-var-1', 'prod-rose01', '3ml', 661.00, 100),
('prod-rose01-var-2', 'prod-rose01', '5ml', 990.00, 100),
('prod-rose01-var-3', 'prod-rose01', '9ml', 1650.00, 100),
('prod-rose01-var-4', 'prod-rose01', '15ml', 2580.00, 100),
('prod-vanilla01-var-1', 'prod-vanilla01', '3ml', 661.00, 100),
('prod-vanilla01-var-2', 'prod-vanilla01', '5ml', 990.00, 100),
('prod-vanilla01-var-3', 'prod-vanilla01', '9ml', 1650.00, 100),
('prod-vanilla01-var-4', 'prod-vanilla01', '15ml', 2580.00, 100),
('prod-genesis-leo-var-1', 'prod-genesis-leo', '3ml', 302.00, 100),
('prod-genesis-leo-var-2', 'prod-genesis-leo', '5ml', 470.00, 100),
('prod-genesis-leo-var-3', 'prod-genesis-leo', '9ml', 790.00, 100),
('prod-genesis-leo-var-4', 'prod-genesis-leo', '15ml', 1250.00, 100),
('prod-venena-var-1', 'prod-venena', '3ml', 411.00, 100),
('prod-venena-var-2', 'prod-venena', '5ml', 640.00, 100),
('prod-venena-var-3', 'prod-venena', '9ml', 1080.00, 100),
('prod-venena-var-4', 'prod-venena', '15ml', 1690.00, 100),
('prod-asdaaf-raneen-var-1', 'prod-asdaaf-raneen', '3ml', 336.00, 100),
('prod-asdaaf-raneen-var-2', 'prod-asdaaf-raneen', '5ml', 520.00, 100),
('prod-asdaaf-raneen-var-3', 'prod-asdaaf-raneen', '9ml', 880.00, 100),
('prod-asdaaf-raneen-var-4', 'prod-asdaaf-raneen', '15ml', 1390.00, 100);

-- 5. Brands
DELETE FROM `brands`;
INSERT INTO `brands` (`name`, `slug`, `is_new`) VALUES
('HERRERA', 'herrera', 0),
('ARMAF', 'armaf', 1),
('DOLCE & GABBANA', 'dolce-gabbana', 0),
('LATTAFA', 'lattafa', 1),
('GIORGIO ARMANI', 'giorgio-armani', 0),
('CALVIN KLEIN', 'calvin-klein', 1),
('CHANEL', 'chanel', 0),
('RIFFS', 'riffs', 0),
('DAVIDOFF', 'davidoff', 0),
('CREED', 'creed', 0),
('AHMED', 'ahmed', 0);

-- 6. Customer Reviews
DELETE FROM `reviews`;
INSERT INTO `reviews` (`id`, `quote`, `content`, `author`, `rating`, `verified`) VALUES
('rev-1', '...and videos. It seemed to be an existing fetched the ...ng more from...', '...and videos. It seemed to be an existing fetched the original blend without any evaporation or adulteration. Ordering more from here next week.', 'Tahmidur Rahman', 5, 1),
('rev-2', '"Best in business. Absolute class."', 'Best in business. Absolute class. Packaging was bulletproof, and the 5ml spray atomizers give the exact same fine mist dispersion as a full retail bottle.', 'Jubayer Islam Bhuiyan', 5, 1),
('rev-3', 'Very wide range of products...', 'Very wide range of products, bottle designs, perfume authenticity, customer service, everything is high quality 💯 Top notch. The customer service is also especially excellent, they are very responsive and also answers and provides your needs/enquiries well. 👌', 'Faiyaz Masud', 5, 1),
('rev-4', 'Great packaging, great decants...', 'Great packaging, great decants, highly recommend! Even came with protective shrink seals on each glass tube.', 'Samiul Masuk Dihan', 5, 1);

-- 7. FAQs
DELETE FROM `faqs`;
INSERT INTO `faqs` (`id`, `question`, `answer`) VALUES
('faq-1', 'What is a decant?', 'A decant is a smaller atomizer that contains a portion of perfume from the original bottle. Decanting means transferring perfume from the main bottle into a smaller bottle. It allows you to test luxury scents on skin for several weeks without committing to full retail prices.'),
('faq-2', 'But I can just test at a perfume shop by sniffing?', 'Sniffing perfume on a paper strip in a boutique only reveals the volatile top notes (first 5-10 minutes). A decant lets you experience the true dry-down, skin chemistry, projection, and sillage over an entire day in your natural climate and routines.'),
('faq-3', 'Are the fragrances 100% Genuine?', 'Every milliliter is extracted directly from original brand flacons sourced from authorized European and Middle Eastern distributors. We never dilute, alter, or mix scents with carrier oils.'),
('faq-4', 'What is the shipping cost?', 'Standard door-to-door delivery inside Dhaka is BDT 70, and outside Dhaka nationwide is BDT 130. We offer free shipping on orders above BDT 3,000.'),
('faq-5', 'How long does shipping take?', 'Orders are freshly decanted within 24 hours of confirmation. Delivery within Dhaka takes 1-2 business days, and all other districts take 2-4 business days via verified express couriers.');

-- 8. Journal Articles
DELETE FROM `journal_articles`;
INSERT INTO `journal_articles` (`id`, `title`, `date`, `publisher`, `description`, `image`) VALUES
('art-1', 'Don\'t Buy Decants From Us Before Reading This!', 'FEB 01, 2026', 'AROMATICA ONE', 'Read this before you buy your first decant. Especially the part about why we genuinely cannot guarantee longevity, and what factors actually control skin chemistry...', '/src/assets/images/article_decant_buyers_guide_1791908274237.jpg'),
('art-2', 'Why Did You Mix Water With My Decant?', 'FEB 01, 2026', 'AROMATICA ONE', 'Weak fragrance does not mean fake decant. Here is what is actually going on, and what you can do about maceration, temperature shock, and olfactory fatigue.', '/src/assets/images/article_perfume_roses_water_1791908274460.jpg'),
('art-3', 'Hidden Reality Of Our Pricing!', 'FEB 01, 2026', 'AROMATICA ONE', 'Our pricing is not just random numbers. Here is the full, unvarnished math behind decant margins, high-pressure glass bottling, and genuine retail procurement.', '/src/assets/images/article_lilac_pricing_1791908274975.jpg');

-- 9. Social Cards
DELETE FROM `social_cards`;
INSERT INTO `social_cards` (`id`, `handle`, `image`, `likes`, `comments`, `tag`) VALUES
('soc-1', '@aromaticone', '/src/assets/images/studio_social_travertine_1791908203434.jpg', 223, 2, 'REALITY ≠ REVIEWS'),
('soc-2', '@aromaticone', '/src/assets/images/studio_social_hand_decant_1791908204628.jpg', 234, 1, 'AUTHENTIC DECANTS'),
('soc-3', '@aromaticone', '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg', 86, 8, 'AUTHENTIC DECANTS'),
('soc-4', '@aromaticone', '/src/assets/images/studio_social_amber_spray_1791908204588.jpg', 85, 5, 'STUDIO AROMA');

-- 10. Homepage Sections
INSERT INTO `homepage_sections` (`section_key`, `title`, `subtitle`, `content_json`, `display_order`) VALUES
('hero', 'LUXURY, BY THE ML', 'THE SIGNATURE DECANTS EDITION · ARRINA ATELIER', '{"headline":"LUXURY, BY THE ML","tagline":"Weightless neroli blossom, cured Madagascar bourbon vanilla, and radiant golden amber suspended in pure olfactory clarity. Engineered for pocket elegance.","specifier":"5 ML ( 75+ SPRAYS )","primary_cta_text":"ORDER PURE PORTIONS · \u09f3 490","secondary_cta_text":"EXPLORE ALL DECANTS","image":"\/src\/assets\/images\/hero_pure_portions_arrina_1791911761493.jpg"}', 1),
('category_marquee', 'Category Marquee', '', '{"items":["SOLAR FLORAL AMBER","EXOTIC OUD & WOODS","GOURMAND VANILLA","FRESH CITRUS & SPICE"]}', 2)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `content_json` = VALUES(`content_json`);

-- 11. Discount Coupons
INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `min_spend`) VALUES
('WELCOME10', 'percent', 10.00, 1000.00)
ON DUPLICATE KEY UPDATE `code` = `code`;
