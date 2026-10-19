export interface DecantSize {
  size: string; // e.g. "3ml", "5ml", "9ml", "15ml"
  price: number; // in BDT (৳)
}

export interface FragranceAttribute {
  id: string;
  name: string; // e.g. "Longevity", "Sillage", "Projection", "Intensity"
  value: number; // 0 to 100 percentage
  enabled: boolean;
}

export interface FragranceProduct {
  id: string;
  brand: string;
  name: string;
  slug?: string;
  category: string; // e.g. "Woody", "Floral", "Gourmand", "Amber"
  gender?: "Him" | "Her" | "Unisex";
  startingPrice: number;
  image: string;
  images?: string[];
  additionalImages?: string[];
  notes?: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  attributes?: FragranceAttribute[];
  sizes: DecantSize[];
  concentration?: string; // e.g. "Eau de Parfum", "Extrait de Parfum"
  shortDescription?: string;
  description?: string;
}

export interface CartItem {
  product: FragranceProduct;
  selectedSize: string;
  price: number;
  quantity: number;
}

export interface ReviewItem {
  id: string;
  quote: string;
  content: string;
  author: string;
  rating: number;
  verified?: boolean;
}

export interface SocialCard {
  id: string;
  handle: string;
  image: string;
  likes: number;
  comments: number;
  tag?: string;
}

export interface JournalArticle {
  id: string;
  date: string;
  publisher: string;
  title: string;
  description: string;
  image: string;
}

export interface VideoShowcaseCard {
  id: string;
  product_id?: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  display_order?: number;
  is_enabled?: boolean;
}

export interface VideoShowcaseSectionData {
  headline?: string;
  tagline?: string;
  badge_text?: string;
  is_enabled?: boolean;
  cards?: VideoShowcaseCard[];
}
