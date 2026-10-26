export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  promoPrice?: number;
  images: string[];
  mainImage: string;
  buyUrl: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface StoreSettings {
  id?: string;
  storeName: string;
  slogan: string;
  announcement: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  cnpj: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroImageUrl: string;
  updatedAt?: string;
}

export interface InstitutionalContent {
  id?: string;
  about: string;
  contact: string;
  privacyPolicy: string;
  termsOfUse: string;
  shippingPolicy: string;
  returnPolicy: string;
  updatedAt?: string;
}

export type ViewRoute = 
  | { type: 'home' }
  | { type: 'catalog'; category?: string; query?: string }
  | { type: 'product'; slug: string }
  | { type: 'institutional'; page: 'sobre' | 'contato' | 'privacidade' | 'termos' | 'entrega' | 'trocas' }
  | { type: 'admin'; tab?: 'products' | 'import' | 'categories' | 'banners' | 'institutional' | 'settings' };
