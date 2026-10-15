export interface DecantSize {
  size: string; // e.g. "3ml", "5ml", "9ml", "15ml"
  price: number; // in BDT (৳)
}

export interface FragranceProduct {
  id: string;
  brand: string;
  name: string;
  category: string; // e.g. "Woody", "Floral", "Gourmand", "Amber"
  gender?: "Him" | "Her" | "Unisex";
  startingPrice: number;
  image: string;
  notes?: string[];
  sizes: DecantSize[];
  concentration?: string; // e.g. "Eau de Parfum", "Extrait de Parfum"
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
