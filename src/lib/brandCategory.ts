// Which house a brand belongs to. Brands not listed count as Arabian (most of the catalogue).
// Edit these lists to re-categorise a house — the homepage and the admin both use them.
export type BrandCategory = 'Designer' | 'Niche' | 'Arabian';

export const DESIGNER_HOUSES = new Set([
  'JEAN PAUL GAULTIER', 'GUCCI', 'PRADA', 'YVES SAINT LAURENT', 'ARIANA GRANDE', 'ELIZABETH ARDEN',
  'CAROLINA HERRERA', 'NARCISO RODRIGUEZ', 'VALENTINO', 'CHANEL', 'VERSACE', 'BURBERRY', 'KENZO',
  'DOLCE & GABBANA', 'CHLOÉ', 'CHLOE', 'CALVIN KLEIN', 'DIOR', 'GIORGIO ARMANI', 'VIKTOR & ROLF',
  'HUGO BOSS', 'TOM FORD', 'HERMÈS', 'HERMES', 'MONTBLANC', 'AZZARO', 'PACO RABANNE', 'RABANNE', 'GIVENCHY', 'JAGUAR',
]);

export const NICHE_HOUSES = new Set([
  'CREED', 'XERJOFF', 'MANCERA', 'KAYALI', 'ESSENTIAL PARFUMS', 'PARFUMS DE MARLY', 'MAISON FRANCIS KURKDJIAN',
  'INITIO', 'MONTALE', 'AMOUAGE', 'NISHANE', 'BYREDO', 'LE LABO', 'MAISON MARGIELA', 'DIPTYQUE', 'JO MALONE',
]);

/** A product's own house (set in the admin) wins; otherwise the brand lists decide. */
export const categoryOf = (brand: string, category?: string | null): BrandCategory => {
  if (category === 'Arabian' || category === 'Designer' || category === 'Niche') return category;
  const n = brand.replace(/&(amp;)+/gi, '&').trim().toUpperCase();
  if (DESIGNER_HOUSES.has(n)) return 'Designer';
  if (NICHE_HOUSES.has(n)) return 'Niche';
  return 'Arabian';
};
