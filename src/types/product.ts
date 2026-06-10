export interface Product {
  id: number;

  shop_id: number;
  category_id: number | null;

  name: string;
  slug: string;
  description: string;

  price: number;
  unit_price: number | null;

  stock: number;
  stock_quantity: number | null;

  weight: number | null;

  images: string[];

  listing_type: string;

  delivery_condition: string | null;

  variety: string | null;
  origin: string | null;
  certification: string | null;

  harvest_date: string | null;
  expiration_date: string | null;

  is_featured: boolean;

  status: string;

  created_at: string;
  updated_at: string;
}