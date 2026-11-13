<?php
/**
 * Spelling-tolerant matching for customer searches.
 * "bacarat rouge" -> Baccarat Rouge 540, "latafa" -> LATTAFA, "vanila serup" ~ "vanilla syrup".
 */

function ppCompact(string $s): string {
    $s = mb_strtolower($s, 'UTF-8');
    return preg_replace('/[^\p{L}\p{N}]+/u', '', $s) ?? '';
}

/** Allowed typo distance for a term of this length. */
function ppTolerance(int $len): int {
    if ($len <= 4) return 0;
    if ($len <= 7) return 1;
    return (int)floor($len * 0.25);
}

/** Smallest edit distance between term and the start / whole of a candidate. */
function ppDistance(string $t, string $cand): int {
    if ($t === '' || $cand === '') return PHP_INT_MAX;
    if (strlen($t) >= 3 && strpos($cand, $t) !== false) return 0;
    $full = levenshtein(substr($t, 0, 255), substr($cand, 0, 255));
    $best = $full;
    for ($k = -1; $k <= 1; $k++) {
        $l = strlen($t) + $k;
        if ($l > 0) $best = min($best, levenshtein($t, substr($cand, 0, $l)));
    }
    return $best;
}

/**
 * Finds what a search term most likely refers to.
 * Returns ['product_id' => ?string, 'brand' => ?string, 'brand_count' => int]
 */
function ppFuzzyResolve(PDO $db, string $term): array {
    $t = ppCompact($term);
    $out = ['product_id' => null, 'brand' => null, 'brand_count' => 0];
    if (strlen($t) < 2) return $out;
    $tol = ppTolerance(strlen($t));

    $rows = $db->query("SELECT id, name, brand FROM products WHERE status = 'published'")->fetchAll();
    $bestId = null; $bestD = PHP_INT_MAX;
    $brands = [];
    foreach ($rows as $r) {
        $n = ppCompact($r['name'] ?? '');
        $b = ppCompact($r['brand'] ?? '');
        $d = min(ppDistance($t, $n), ppDistance($t, $b . $n));
        if ($d < $bestD) { $bestD = $d; $bestId = $r['id']; }
        if ($b !== '') $brands[$b][] = $r['id'];
    }
    // Brand match wins only when the term is closer to a brand than to any perfume name
    $bestBrand = null; $bestBD = PHP_INT_MAX;
    foreach ($brands as $b => $ids) {
        $d = levenshtein($t, $b);
        if ($d < $bestBD) { $bestBD = $d; $bestBrand = $b; }
    }
    if ($bestBrand !== null && $bestBD <= $tol && strlen($t) <= strlen($bestBrand) + 2) {
        $out['brand'] = $bestBrand;
        $out['brand_count'] = count($brands[$bestBrand]);
        return $out;
    }
    if ($bestId !== null && $bestD <= $tol) {
        $out['product_id'] = $bestId;
    }
    return $out;
}

/** Groups similar unmatched spellings together: returns map term => canonical term. */
function ppClusterTerms(array $termCounts): array {
    arsort($termCounts);
    $canon = []; $map = [];
    foreach ($termCounts as $term => $cnt) {
        $c = ppCompact((string)$term);
        $found = null;
        foreach ($canon as $head => $hc) {
            if (levenshtein($c, $hc) <= ppTolerance(max(strlen($c), strlen($hc)))) { $found = $head; break; }
        }
        if ($found === null) { $canon[$term] = $c; $found = $term; }
        $map[$term] = $found;
    }
    return $map;
}
