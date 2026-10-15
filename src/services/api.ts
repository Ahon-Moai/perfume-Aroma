import { FragranceProduct, ReviewItem, JournalArticle, SocialCard } from '../types';

export const API_BASE_URL = '/api';

export async function fetchPublicProducts(): Promise<FragranceProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products.php`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('API connection failed, using local product catalog', err);
  }
  return [];
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
