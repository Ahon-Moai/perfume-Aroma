import { FragranceProduct, ReviewItem, JournalArticle, SocialCard } from '../types';

export const API_BASE_URL = '/api';

// Images that were saved with development paths (/src/assets/images/...) are served from the build instead
const BUNDLED_IMAGES = import.meta.glob('../assets/images/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const IMAGE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(BUNDLED_IMAGES).map(([path, url]) => [path.split('/').pop() as string, url])
);

const ENTITY_MAP: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#039': "'", '#39': "'", nbsp: '\u00a0' };
function decodeEntities(str: string): string {
  let prev = '';
  let out = str;
  // Repeat to undo text that was escaped several times (e.g. "&amp;amp;amp;")
  for (let i = 0; i < 8 && out !== prev && out.includes('&'); i++) {
    prev = out;
    out = out.replace(/&(amp|lt|gt|quot|apos|#0?39|nbsp);/gi, (m, k) => ENTITY_MAP[k.toLowerCase()] ?? m);
  }
  return out;
}

/** Cleans API data for display: fixes over-escaped text and old /src/assets image paths. */
export function cleanApiData<T>(value: T): T {
  if (typeof value === 'string') {
    let v: string = value;
    if (v.startsWith('/src/assets/images/')) {
      const name = v.split('/').pop() as string;
      if (IMAGE_BY_NAME[name]) return IMAGE_BY_NAME[name] as unknown as T;
    }
    if (v.includes('&')) v = decodeEntities(v);
    return v as unknown as T;
  }
  if (Array.isArray(value)) return value.map((x) => cleanApiData(x)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value as any)) out[k] = cleanApiData(v);
    return out;
  }
  return value;
}

/**
 * Safely extracts a string error message from string, object, or nested API error responses.
 * Prevents React Error #31 (rendering objects directly as React children).
 */
export function getErrorMessage(err: any, fallbackMessage: string = 'An error occurred'): string {
  if (!err) return fallbackMessage;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    if (typeof err.error === 'string') return err.error;
    if (typeof err.error === 'object' && err.error) {
      if (typeof err.error.message === 'string') return err.error.message;
      if (typeof err.error.code === 'string') return `${err.error.code}${err.error.message ? `: ${err.error.message}` : ''}`;
    }
    if (typeof err.message === 'string') return err.message;
    if (typeof err.code === 'string') return `${err.code}${err.message ? `: ${err.message}` : ''}`;
    try {
      const json = JSON.stringify(err);
      if (json && json !== '{}') return json;
    } catch (_) {}
  }
  return fallbackMessage;
}

export async function fetchPublicProducts(queryParams?: Record<string, string>): Promise<FragranceProduct[]> {
  try {
    let url = `${API_BASE_URL}/products.php`;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params.append(k, v);
        }
      });
      const str = params.toString();
      if (str) url += `?${str}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return cleanApiData(data.data);
    }
  } catch (err) {
    console.warn('API connection failed, using local product catalog', err);
  }
  return [];
}

export async function fetchPublicCollections(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/collections.php`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return cleanApiData(data.data);
    }
  } catch (err) {
    console.warn('API collections fetch failed', err);
  }
  return [];
}

export async function fetchCollectionBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/collections.php?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (data.success && data.data) {
      return cleanApiData(data.data);
    }
  } catch (err) {
    console.warn('API collection fetch by slug failed', err);
  }
  return null;
}

export async function fetchHomepageData() {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage.php`);
    const data = await res.json();
    if (data.success && data.data) {
      return cleanApiData(data.data);
    }
  } catch (err) {
    console.warn('API homepage fetch failed', err);
  }
  return null;
}

export async function fetchStoreSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/settings.php`);
    const data = await res.json();
    if (data.success && data.data) {
      return cleanApiData(data.data);
    }
  } catch (err) {
    console.warn('API settings fetch failed', err);
  }
  return null;
}

export async function submitOrder(orderPayload: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city_zone: 'inside_dhaka' | 'outside_dhaka';
  payment_method: string;
  coupon_code?: string;
  items: Array<{
    product_id: string;
    selected_size: string;
    quantity: number;
  }>;
}) {
  const res = await fetch(`${API_BASE_URL}/orders.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });
  return await res.json();
}

export async function fetchFinderMetadata(): Promise<import('../types').FinderMetadata | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations.php`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch finder metadata', err);
  }
  return null;
}

export async function getPerfumeRecommendations(
  answers: import('../types').FinderAnswers
): Promise<import('../types').RecommendationResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(answers)
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Failed to calculate fragrance recommendations', err);
  }
  return null;
}
