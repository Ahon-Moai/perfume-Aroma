import { FragranceProduct, ReviewItem, JournalArticle, SocialCard } from '../types';

export const API_BASE_URL = '/api';

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
      return data.data;
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
      return data.data;
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
      return data.data;
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
      return data.data;
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
      return data.data;
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
