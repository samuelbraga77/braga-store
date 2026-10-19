export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  externalUrl: string;
  currentPrice: number;
  previousPrice?: number;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  additionalCategories?: string[];
  mainImage: string;
  gallery?: string[];
  imageAlt?: string;
  brand?: string;
  sku?: string;
  keywords?: string;
  specifications?: ProductSpecification[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  isOffer: boolean;
  status: 'draft' | 'published';
  buttonText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order: number;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  isExternal?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  accentColor: string;
  trackingUrl?: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address?: string;
    businessHours: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleSearchConsoleTag?: string;
    metaKeywords?: string;
  };
  navigation: NavItem[];
  cnpj?: string;
  footer: {
    aboutText: string;
    legalNotice: string;
    showSocialLinks: boolean;
  };
}

export interface Order {
  id: string;
  orderCode: string;
  productId: string;
  productName: string;
  productImage?: string;
  customerName: string;
  customerEmail: string;
  customerCity?: string;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered';
  deliveredAt?: string;
  deliveryProofPhoto?: string;
  deliveryProofUploadedAt?: string;
  reviewStatus?: 'unreviewed' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  status: 'pending' | 'approved' | 'hidden';
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface InstitutionalPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  userEmail: string;
  timestamp: string;
}
