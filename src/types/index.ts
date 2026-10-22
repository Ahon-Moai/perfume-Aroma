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

export interface ScentProfile {
  fragranceFamilies?: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  seasons?: string[];
  occasions?: string[];
  moods?: string[];
  intensity?: string;
  projection?: string;
  longevity?: string;
  concentration?: string;
  genderPositioning?: string;
  daytimeNighttime?: string[];
  sweetness?: string;
  scentDescription?: string;
  recommendationExplanation?: string;
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
  scentProfile?: ScentProfile;
  scent_profile?: ScentProfile;
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

export interface CampaignBannersData {
  section_title?: string;
  for_him_title?: string;
  for_him_button_text?: string;
  for_him_image?: string;
  for_her_title?: string;
  for_her_button_text?: string;
  for_her_image?: string;
}

export interface SeasonCardData {
  id: string;
  name: string;
  description: string;
  image: string;
  alt?: string;
}

export interface SeasonsGalleryData {
  section_title?: string;
  section_subtitle?: string;
  cards?: SeasonCardData[];
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  rule_type?: 'manual' | 'gender' | 'category' | 'featured' | 'new_arrival' | 'all';
  rule_value?: string;
  display_order?: number;
  is_enabled?: boolean;
  mapped_product_ids?: string[];
}

export interface FilterState {
  gender: string[];
  family: string[];
  season: string[];
  occasion: string[];
  brand: string[];
  size: string[];
  concentration: string[];
  minPrice: string;
  maxPrice: string;
  featured: boolean;
  newArrival: boolean;
  sort: string;
  search: string;
}
