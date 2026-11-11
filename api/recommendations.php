<?php
/**
 * Intelligent AI Perfume Finder Recommendation REST Endpoint
 *
 * Deterministic rule-based recommendation algorithm evaluating active product inventory.
 * No external paid AI API required.
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Return metadata for questions (e.g. price tiers calculated from current catalog)
    try {
        $priceStmt = $db->query("SELECT MIN(starting_price) as min_price, MAX(starting_price) as max_price, AVG(starting_price) as avg_price FROM products WHERE status = 'published'");
        $priceRow = $priceStmt->fetch() ?: ['min_price' => 300, 'max_price' => 1500, 'avg_price' => 500];

        $minP = (float)($priceRow['min_price'] ?? 300);
        $maxP = (float)($priceRow['max_price'] ?? 1500);
        $avgP = (float)($priceRow['avg_price'] ?? 500);

        // Budget tier cutoffs
        $budgetLimit = round($minP + ($avgP - $minP) * 0.75, -1);
        $midLimit = round($avgP + ($maxP - $avgP) * 0.5, -1);

        jsonResponse([
            'currency' => 'BDT',
            'currency_symbol' => '৳',
            'price_range' => [
                'min' => $minP,
                'max' => $maxP,
                'avg' => $avgP
            ],
            'budget_tiers' => [
                'budget' => ['label' => 'Budget-friendly', 'description' => "Under ৳ {$budgetLimit}", 'max' => $budgetLimit],
                'mid' => ['label' => 'Mid-range', 'description' => "৳ {$budgetLimit} – ৳ {$midLimit}", 'min' => $budgetLimit, 'max' => $midLimit],
                'premium' => ['label' => 'Premium', 'description' => "Above ৳ {$midLimit}", 'min' => $midLimit],
                'any' => ['label' => 'No Budget Limit', 'description' => 'Show me the best match regardless of price']
            ]
        ], 200);
    } catch (\Exception $e) {
        jsonError('Failed to fetch finder metadata: ' . $e->getMessage(), 500);
    }
}

if ($method !== 'POST') {
    jsonError('Method not allowed', 405);
}

// Handle Recommendation Calculation
$input = getJsonInput();

// 1. Sanitize & Validate incoming customer answers
$targetGender = sanitizeString($input['gender'] ?? null); // 'Him', 'Her', 'Unisex', 'Doesn\'t matter'
$families = is_array($input['families'] ?? null) ? array_map('sanitizeString', $input['families']) : [];
$occasion = sanitizeString($input['occasion'] ?? null);
$season = sanitizeString($input['season'] ?? null);
$intensity = sanitizeString($input['intensity'] ?? null);
$longevity = sanitizeString($input['longevity'] ?? null);
$budget = sanitizeString($input['budget'] ?? null); // 'budget', 'mid', 'premium', 'any'
$experience = sanitizeString($input['experience'] ?? null);

// 2. Query available, published products with their variants
try {
    $stmt = $db->query("SELECT * FROM products WHERE status = 'published'");
    $products = $stmt->fetchAll();

    if (empty($products)) {
        jsonResponse([
            'profileSummary' => 'No published products found in the catalog.',
            'recommendations' => [],
            'fallbackApplied' => false,
            'totalEvaluated' => 0
        ], 200);
    }

    // Load active variants with stock > 0 for stock validation
    $productIds = array_column($products, 'id');
    $inClause = implode(',', array_fill(0, count($productIds), '?'));
    $varStmt = $db->prepare("SELECT id, product_id, size, price, stock_qty, image FROM product_variants WHERE product_id IN ($inClause) AND is_available = 1 AND stock_qty > 0 ORDER BY price ASC");
    $varStmt->execute($productIds);
    $activeVariants = $varStmt->fetchAll();

    $variantsByProduct = [];
    foreach ($activeVariants as $v) {
        $variantsByProduct[$v['product_id']][] = [
            'id' => $v['id'],
            'size' => $v['size'],
            'price' => (float)$v['price'],
            'stock_qty' => (int)$v['stock_qty'],
            'image' => $v['image'] ?? null
        ];
    }

    // Determine budget cutoffs
    $allStartingPrices = array_column($products, 'starting_price');
    $minCatalogPrice = !empty($allStartingPrices) ? min($allStartingPrices) : 300;
    $maxCatalogPrice = !empty($allStartingPrices) ? max($allStartingPrices) : 1500;
    $avgCatalogPrice = !empty($allStartingPrices) ? (array_sum($allStartingPrices) / count($allStartingPrices)) : 600;

    $budgetCutoff = round($minCatalogPrice + ($avgCatalogPrice - $minCatalogPrice) * 0.75, -1);
    $midCutoff = round($avgCatalogPrice + ($maxCatalogPrice - $avgCatalogPrice) * 0.5, -1);

    // 3. Score each product deterministically
    $scoredProducts = [];

    foreach ($products as $p) {
        $pId = $p['id'];
        $purchasableVariants = $variantsByProduct[$pId] ?? [];
        $invQty = (int)($p['inventory_qty'] ?? 0);

        // Strict stock validation: product must have purchasable variants or inventory_qty > 0
        if (empty($purchasableVariants) && $invQty <= 0) {
            continue;
        }

        // Parse attributes and scent profile safely
        $notes = json_decode($p['notes'] ?? '[]', true) ?: [];
        $topNotes = json_decode($p['top_notes'] ?? '[]', true) ?: [];
        $heartNotes = json_decode($p['heart_notes'] ?? '[]', true) ?: [];
        $baseNotes = json_decode($p['base_notes'] ?? '[]', true) ?: [];
        $attributes = json_decode($p['attributes_json'] ?? '[]', true) ?: [];
        $scentProfile = json_decode($p['scent_profile_json'] ?? '{}', true) ?: [];

        $productFamilies = array_map('strtolower', $scentProfile['fragranceFamilies'] ?? [$p['category'] ?? '']);
        $productCategory = strtolower($p['category'] ?? '');
        $productGender = $p['gender'] ?? 'Unisex';
        $productSeasons = array_map('strtolower', $scentProfile['seasons'] ?? []);
        $productOccasions = array_map('strtolower', $scentProfile['occasions'] ?? []);
        $productMoods = array_map('strtolower', $scentProfile['moods'] ?? []);
        $productIntensity = strtolower($scentProfile['intensity'] ?? '');
        $productProjection = strtolower($scentProfile['projection'] ?? '');
        $productLongevity = strtolower($scentProfile['longevity'] ?? '');
        $productSweetness = strtolower($scentProfile['sweetness'] ?? '');
        $productAccords = $scentProfile['accords'] ?? [];

        // Lowest purchasable price
        $effectiveStartingPrice = !empty($purchasableVariants)
            ? (float)$purchasableVariants[0]['price']
            : (float)$p['starting_price'];

        $matchFactors = [];
        $explanations = [];

        // ----------------------------------------------------
        // Criteria 1: Fragrance Family & Accords (Weight: 25%)
        // ----------------------------------------------------
        $familyScore = 0.5; // neutral baseline if skipped
        if (!empty($families)) {
            $matchedFamilies = [];
            foreach ($families as $userFam) {
                $cleanUserFam = strtolower(trim($userFam));
                $found = false;

                // Check against fragrance families & category
                foreach ($productFamilies as $pf) {
                    if (strpos($pf, $cleanUserFam) !== false || strpos($cleanUserFam, $pf) !== false) {
                        $found = true;
                        break;
                    }
                }

                if (!$found && (strpos($productCategory, $cleanUserFam) !== false || strpos($cleanUserFam, $productCategory) !== false)) {
                    $found = true;
                }

                // Check keywords in notes and accords
                if (!$found) {
                    $familyKeywords = [
                        'fresh & aquatic' => ['fresh', 'aquatic', 'marine', 'citrus', 'sea', 'water', 'dew'],
                        'woody & earthy' => ['woody', 'earthy', 'wood', 'cedar', 'sandalwood', 'vetiver', 'birch', 'patchouli'],
                        'sweet & gourmand' => ['sweet', 'gourmand', 'vanilla', 'tonka', 'caramel', 'praline', 'sugar'],
                        'floral' => ['floral', 'rose', 'jasmine', 'neroli', 'blossom', 'white floral', 'iris'],
                        'citrus & zesty' => ['citrus', 'bergamot', 'lemon', 'orange', 'grapefruit', 'zesty', 'mandarin'],
                        'spicy & warm' => ['spicy', 'warm', 'cardamom', 'saffron', 'cinnamon', 'pepper', 'peppercorn', 'nutmeg', 'amber'],
                        'musky' => ['musky', 'musk', 'white musk', 'cashmeran'],
                        'oud & oriental' => ['oud', 'oriental', 'amber', 'incense', 'leather', 'resin', 'birch'],
                        'aromatic' => ['aromatic', 'lavender', 'sage', 'herbal', 'rosemary', 'thyme']
                    ];

                    $keywords = $familyKeywords[$cleanUserFam] ?? [str_replace('&', '', $cleanUserFam)];
                    foreach ($keywords as $kw) {
                        $kw = trim($kw);
                        if (empty($kw)) continue;
                        if (strpos($productCategory, $kw) !== false) { $found = true; break; }
                        foreach ($productAccords as $acc) {
                            if (strpos(strtolower($acc['name'] ?? ''), $kw) !== false) { $found = true; break 2; }
                        }
                        foreach (array_merge($topNotes, $heartNotes, $baseNotes, $notes) as $note) {
                            if (strpos(strtolower($note), $kw) !== false) { $found = true; break 2; }
                        }
                    }
                }

                if ($found) {
                    $matchedFamilies[] = $userFam;
                }
            }

            if (!empty($matchedFamilies)) {
                $ratio = count($matchedFamilies) / count($families);
                // 1 match gives at least 0.75, all match gives 1.0
                $familyScore = min(1.0, 0.70 + (0.30 * $ratio));
                $explanations[] = "fits your preference for " . implode(' & ', array_slice($matchedFamilies, 0, 2)) . " notes";
            } else {
                $familyScore = 0.20;
            }
        }
        $matchFactors['family'] = $familyScore * 0.25;

        // ----------------------------------------------------
        // Criteria 2: Gender Preference (Weight: 15%)
        // ----------------------------------------------------
        $genderScore = 1.0;
        if ($targetGender && $targetGender !== "Doesn't matter" && strtolower($targetGender) !== 'any') {
            if (strtolower($targetGender) === 'unisex') {
                $genderScore = ($productGender === 'Unisex') ? 1.0 : 0.65;
            } elseif (strtolower($targetGender) === 'for him' || strtolower($targetGender) === 'him') {
                if ($productGender === 'Him') {
                    $genderScore = 1.0;
                } elseif ($productGender === 'Unisex') {
                    $genderScore = 0.85;
                } else {
                    $genderScore = 0.20;
                }
            } elseif (strtolower($targetGender) === 'for her' || strtolower($targetGender) === 'her') {
                if ($productGender === 'Her') {
                    $genderScore = 1.0;
                } elseif ($productGender === 'Unisex') {
                    $genderScore = 0.85;
                } else {
                    $genderScore = 0.20;
                }
            }
        }
        $matchFactors['gender'] = $genderScore * 0.15;

        // ----------------------------------------------------
        // Criteria 3: Occasion Suitability (Weight: 15%)
        // ----------------------------------------------------
        $occasionScore = 0.6; // neutral default
        if ($occasion && strtolower($occasion) !== 'any') {
            $cleanOcc = strtolower($occasion);
            $occFound = false;

            // Direct check in occasions
            foreach ($productOccasions as $po) {
                if (strpos($po, $cleanOcc) !== false || strpos($cleanOcc, $po) !== false) {
                    $occFound = true;
                    break;
                }
            }

            if (!$occFound) {
                $occasionMap = [
                    'everyday / casual' => ['daily', 'casual', 'everyday', 'office', 'versatile'],
                    'office / professional' => ['office', 'work', 'daily', 'professional', 'formal', 'clean'],
                    'date night' => ['date night', 'evening', 'party', 'nightout', 'romantic', 'seductive'],
                    'parties & events' => ['party', 'nightout', 'special occasions', 'evening', 'events'],
                    'special occasions' => ['special occasions', 'formal', 'black tie', 'gala', 'celebrations'],
                    'gym / outdoor' => ['daily', 'casual', 'fresh', 'refreshing', 'clean', 'outdoor']
                ];
                $occKeywords = $occasionMap[$cleanOcc] ?? [$cleanOcc];
                foreach ($occKeywords as $okw) {
                    foreach ($productOccasions as $po) {
                        if (strpos($po, $okw) !== false) { $occFound = true; break 2; }
                    }
                    foreach ($productMoods as $pm) {
                        if (strpos($pm, $okw) !== false) { $occFound = true; break 2; }
                    }
                }
            }

            if ($occFound) {
                $occasionScore = 1.0;
                $explanations[] = "ideal for " . strtolower(explode('/', $occasion)[0]);
            } else {
                $occasionScore = 0.35;
            }
        }
        $matchFactors['occasion'] = $occasionScore * 0.15;

        // ----------------------------------------------------
        // Criteria 4: Season Suitability (Weight: 10%)
        // ----------------------------------------------------
        $seasonScore = 0.7; // default
        if ($season && strtolower($season) !== 'any') {
            $cleanSeason = strtolower($season);
            if ($cleanSeason === 'all seasons' || in_array('all seasons', $productSeasons)) {
                $seasonScore = 1.0;
            } else {
                $seasonFound = false;
                foreach ($productSeasons as $ps) {
                    if (strpos($ps, $cleanSeason) !== false) {
                        $seasonFound = true;
                        break;
                    }
                }
                if ($seasonFound) {
                    $seasonScore = 1.0;
                    $explanations[] = "well-balanced for {$season} wear";
                } else {
                    $seasonScore = 0.40;
                }
            }
        }
        $matchFactors['season'] = $seasonScore * 0.10;

        // ----------------------------------------------------
        // Criteria 5: Longevity (Weight: 10%)
        // ----------------------------------------------------
        $longevityScore = 0.7;
        if ($longevity) {
            $userLong = strtolower($longevity);
            if (strpos($userLong, '8+') !== false) {
                if (strpos($productLongevity, 'eternal') !== false || strpos($productLongevity, '12+') !== false) {
                    $longevityScore = 1.0;
                    $explanations[] = "offers eternal 12+ hour longevity";
                } elseif (strpos($productLongevity, 'long-lasting') !== false || strpos($productLongevity, '6-12') !== false) {
                    $longevityScore = 0.85;
                } else {
                    $longevityScore = 0.40;
                }
            } elseif (strpos($userLong, '6–8') !== false || strpos($userLong, '6-8') !== false) {
                if (strpos($productLongevity, 'long-lasting') !== false || strpos($productLongevity, '6-12') !== false) {
                    $longevityScore = 1.0;
                    $explanations[] = "delivers 6–12 hour lasting power";
                } elseif (strpos($productLongevity, 'eternal') !== false) {
                    $longevityScore = 0.90;
                } else {
                    $longevityScore = 0.60;
                }
            } elseif (strpos($userLong, '4–6') !== false || strpos($userLong, '4-6') !== false) {
                if (strpos($productLongevity, 'moderate') !== false || strpos($productLongevity, '3-6') !== false) {
                    $longevityScore = 1.0;
                } else {
                    $longevityScore = 0.75;
                }
            } elseif (strpos($userLong, '2–4') !== false || strpos($userLong, '2-4') !== false) {
                if (strpos($productLongevity, 'weak') !== false || strpos($productLongevity, 'moderate') !== false) {
                    $longevityScore = 1.0;
                } else {
                    $longevityScore = 0.70;
                }
            }
        }
        $matchFactors['longevity'] = $longevityScore * 0.10;

        // ----------------------------------------------------
        // Criteria 6: Projection / Intensity (Weight: 10%)
        // ----------------------------------------------------
        $intensityScore = 0.7;
        if ($intensity) {
            $cleanInt = strtolower($intensity);
            if (strpos($cleanInt, 'beast mode') !== false || strpos($cleanInt, 'powerful') !== false) {
                if (strpos($productIntensity, 'intensely bold') !== false || strpos($productProjection, 'enormous') !== false || strpos($productProjection, 'room filler') !== false) {
                    $intensityScore = 1.0;
                    $explanations[] = "boasts commanding projection";
                } elseif (strpos($productIntensity, 'strong') !== false) {
                    $intensityScore = 0.85;
                } else {
                    $intensityScore = 0.35;
                }
            } elseif (strpos($cleanInt, 'strong') !== false) {
                if (strpos($productIntensity, 'strong') !== false || strpos($productProjection, 'room filler') !== false) {
                    $intensityScore = 1.0;
                    $explanations[] = "strong, noticeable projection";
                } elseif (strpos($productIntensity, 'intensely bold') !== false || strpos($productIntensity, 'moderate') !== false) {
                    $intensityScore = 0.80;
                } else {
                    $intensityScore = 0.40;
                }
            } elseif (strpos($cleanInt, 'moderate') !== false) {
                if (strpos($productIntensity, 'moderate') !== false || strpos($productProjection, 'arm') !== false) {
                    $intensityScore = 1.0;
                } else {
                    $intensityScore = 0.65;
                }
            } elseif (strpos($cleanInt, 'light') !== false || strpos($cleanInt, 'subtle') !== false) {
                if (strpos($productIntensity, 'soft') !== false || strpos($productProjection, 'skin') !== false) {
                    $intensityScore = 1.0;
                } else {
                    $intensityScore = 0.50;
                }
            }
        }
        $matchFactors['intensity'] = $intensityScore * 0.10;

        // ----------------------------------------------------
        // Criteria 7: Budget Preference (Weight: 10%)
        // ----------------------------------------------------
        $budgetScore = 1.0;
        if ($budget && strtolower($budget) !== 'no budget limit' && strtolower($budget) !== 'any') {
            $cleanB = strtolower($budget);
            if ($cleanB === 'budget' || strpos($cleanB, 'budget') !== false) {
                if ($effectiveStartingPrice <= $budgetCutoff) {
                    $budgetScore = 1.0;
                } elseif ($effectiveStartingPrice <= $midCutoff) {
                    $budgetScore = 0.50;
                } else {
                    $budgetScore = 0.20;
                }
            } elseif ($cleanB === 'mid' || strpos($cleanB, 'mid') !== false) {
                if ($effectiveStartingPrice >= $budgetCutoff && $effectiveStartingPrice <= $midCutoff) {
                    $budgetScore = 1.0;
                } else {
                    $budgetScore = 0.70;
                }
            } elseif ($cleanB === 'premium' || strpos($cleanB, 'premium') !== false) {
                if ($effectiveStartingPrice >= $midCutoff) {
                    $budgetScore = 1.0;
                } else {
                    $budgetScore = 0.75;
                }
            }
        }
        $matchFactors['budget'] = $budgetScore * 0.10;

        // ----------------------------------------------------
        // Criteria 8: Fragrance Experience / Mood (Weight: 5%)
        // ----------------------------------------------------
        $expScore = 0.6;
        if ($experience) {
            $cleanExp = strtolower($experience);
            $expMap = [
                'safe & crowd-pleasing' => ['clean', 'refreshing', 'versatile', 'mass_appeal', 'casual', 'elegant'],
                'unique & different' => ['mysterious', 'bold', 'special', 'niche', 'complex'],
                'compliment getter' => ['seductive', 'mysterious', 'sweet', 'warm', 'mass_appeal'],
                'luxury & sophisticated' => ['elegant', 'sophisticated', 'regal', 'royal', 'amber'],
                'bold & attention-grabbing' => ['bold', 'powerful', 'intensely bold', 'strong']
            ];

            $expKeywords = $expMap[$cleanExp] ?? [$cleanExp];
            $foundExp = false;
            foreach ($expKeywords as $ekw) {
                foreach ($productMoods as $pm) {
                    if (strpos($pm, $ekw) !== false) { $foundExp = true; break 2; }
                }
                if (strpos($productCategory, $ekw) !== false) { $foundExp = true; break; }
            }

            if ($foundExp) {
                $expScore = 1.0;
                $explanations[] = "matches your desired " . strtolower(explode('&', $experience)[0]) . " vibe";
            } else {
                $expScore = 0.40;
            }
        }
        $matchFactors['experience'] = $expScore * 0.05;

        // Compute total compatibility score (0 to 100%)
        $totalCompatibility = array_sum($matchFactors) * 100;
        $totalCompatibility = max(10, min(99, round($totalCompatibility)));

        // Craft human-readable, honest explanation
        $whyText = "";
        if (!empty($scentProfile['recommendationExplanation'])) {
            $whyText = $scentProfile['recommendationExplanation'];
        } else {
            if (!empty($explanations)) {
                $whyText = "This fragrance " . implode(', ', array_slice($explanations, 0, 2)) . ".";
                if (!empty($baseNotes)) {
                    $whyText .= " Featuring distinctive base notes of " . implode(', ', array_slice($baseNotes, 0, 2)) . ".";
                }
            } else {
                $whyText = "A versatile composition from {$p['brand']} offering a distinct {$p['category']} olfactory signature.";
            }
        }

        // Format purchasable sizes
        $sizes = !empty($purchasableVariants) ? $purchasableVariants : [
            ['id' => $pId . '-default', 'size' => '5ml', 'price' => $effectiveStartingPrice, 'stock_qty' => $invQty, 'image' => null]
        ];

        $scoredProducts[] = [
            'id' => $p['id'],
            'brand' => $p['brand'],
            'name' => $p['name'],
            'slug' => $p['slug'],
            'category' => $p['category'],
            'gender' => $p['gender'],
            'concentration' => $p['concentration'],
            'startingPrice' => $effectiveStartingPrice,
            'image' => $p['image'],
            'compatibilityScore' => $totalCompatibility,
            'matchScore' => $totalCompatibility,
            'explanation' => "{$totalCompatibility}% Match — " . $whyText,
            'whyMatches' => $whyText,
            'fragranceFamily' => !empty($scentProfile['fragranceFamilies']) ? implode(', ', $scentProfile['fragranceFamilies']) : $p['category'],
            'accords' => !empty($productAccords) ? $productAccords : [],
            'longevity' => $scentProfile['longevity'] ?? '6-12 hrs',
            'projection' => $scentProfile['projection'] ?? 'Moderate',
            'topNotes' => $topNotes,
            'heartNotes' => $heartNotes,
            'baseNotes' => $baseNotes,
            'sizes' => $sizes,
            'shortDescription' => $p['short_description']
        ];
    }

    // 4. Sort by compatibility score descending
    usort($scoredProducts, function ($a, $b) {
        return $b['compatibilityScore'] <=> $a['compatibilityScore'];
    });

    // 5. Fallback relaxation logic:
    // If top score is very low (< 50%), indicate fallback relaxation
    $fallbackApplied = false;
    $minAcceptableThreshold = 45;
    $filteredRecommendations = array_filter($scoredProducts, function ($p) use ($minAcceptableThreshold) {
        return $p['compatibilityScore'] >= $minAcceptableThreshold;
    });

    if (empty($filteredRecommendations) && !empty($scoredProducts)) {
        $fallbackApplied = true;
        // Take top 2-3 anyway as alternative matches
        $filteredRecommendations = array_slice($scoredProducts, 0, 3);
    }

    // Return top 3-5 recommendations
    $topRecommendations = array_slice(array_values($filteredRecommendations), 0, 5);

    // Profile summary based on user choices
    $profileParts = [];
    if (!empty($families)) $profileParts[] = implode(' & ', array_map(function($f) { return html_entity_decode($f, ENT_QUOTES, 'UTF-8'); }, $families));
    if ($targetGender && $targetGender !== "Doesn't matter") $profileParts[] = html_entity_decode($targetGender, ENT_QUOTES, 'UTF-8');
    if ($season && $season !== "All Seasons") $profileParts[] = html_entity_decode($season, ENT_QUOTES, 'UTF-8');
    if ($occasion) $profileParts[] = html_entity_decode($occasion, ENT_QUOTES, 'UTF-8');

    $profileSummary = !empty($profileParts)
        ? "Curated for " . implode(', ', $profileParts)
        : "Curated based on your personalized olfactory preferences.";

    jsonResponse([
        'profileSummary' => $profileSummary,
        'recommendations' => $topRecommendations,
        'fallbackApplied' => $fallbackApplied,
        'totalEvaluated' => count($products),
        'totalEligible' => count($scoredProducts)
    ], 200);

} catch (\Exception $e) {
    jsonError('Recommendation calculation failed: ' . $e->getMessage(), 500);
}
