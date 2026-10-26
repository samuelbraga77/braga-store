/**
 * @license
 * Braga Store - Standalone Local Storage & Admin Auth Provider
 * Substitui Firebase e Google Auth por armazenamento local persistente e autenticação por senha.
 */

import { Product, Category, StoreSettings, InstitutionalContent } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_INSTITUTIONAL } from '../data/initialData';

// Senha mestra oficial do administrador
export const ADMIN_PASSWORD = '88049901';

// Chaves de armazenamento local
const STORAGE_KEYS = {
  AUTH: 'bragastore_admin_auth',
  PRODUCTS: 'braga_store_products',
  CATEGORIES: 'braga_store_categories',
  SETTINGS: 'braga_store_settings',
  INSTITUTIONAL: 'braga_store_institutional'
} as const;

// Verificação da senha
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}

// Checagem de autenticação persistente
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

// Salva ou remove a sessão do administrador
export function setAdminSession(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      localStorage.setItem(STORAGE_KEYS.AUTH, ADMIN_PASSWORD);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  } catch (e) {
    console.warn('Erro ao atualizar sessão do administrador:', e);
  }
}

// Encerra sessão do administrador
export function logoutAdmin(): void {
  setAdminSession(false);
}

// Compatibilidade com código legado
export function checkIsAdmin(): boolean {
  return isAdminAuthenticated();
}

// Helpers genéricos de LocalStorage
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Erro ao persistir dados locais:', e);
  }
}

// ======================= OPERAÇÕES DE PRODUTOS =======================

export async function fetchCatalogProducts(): Promise<Product[]> {
  const local = getLocal<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (local && Array.isArray(local) && local.length > 0) {
    return local;
  }
  // Se ainda não existir dados salvos, inicializa com o catálogo padrão
  setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

export async function saveProduct(product: Product): Promise<void> {
  const cleanProduct: Product = {
    ...product,
    updatedAt: new Date().toISOString()
  };

  const current = await fetchCatalogProducts();
  const existsIndex = current.findIndex(p => p.id === product.id);
  const updatedList = existsIndex >= 0
    ? current.map(p => p.id === product.id ? cleanProduct : p)
    : [cleanProduct, ...current];

  setLocal(STORAGE_KEYS.PRODUCTS, updatedList);
}

export async function deleteProduct(productId: string): Promise<void> {
  const current = await fetchCatalogProducts();
  const filtered = current.filter(p => p.id !== productId);
  setLocal(STORAGE_KEYS.PRODUCTS, filtered);
}

// ======================= OPERAÇÕES DE CATEGORIAS =======================

export async function fetchCategories(): Promise<Category[]> {
  const local = getLocal<Category[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (local && Array.isArray(local) && local.length > 0) {
    return local;
  }
  setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
}

export async function saveCategory(category: Category): Promise<void> {
  const current = await fetchCategories();
  const existsIndex = current.findIndex(c => c.id === category.id);
  const updatedList = existsIndex >= 0
    ? current.map(c => c.id === category.id ? category : c)
    : [...current, category];

  setLocal(STORAGE_KEYS.CATEGORIES, updatedList);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const current = await fetchCategories();
  const filtered = current.filter(c => c.id !== categoryId);
  setLocal(STORAGE_KEYS.CATEGORIES, filtered);
}

// ======================= CONFIGURAÇÕES E INSTITUCIONAL =======================

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const local = getLocal<StoreSettings | null>(STORAGE_KEYS.SETTINGS, null);
  if (local) {
    return { ...INITIAL_SETTINGS, ...local };
  }
  setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const cleanSettings: StoreSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  setLocal(STORAGE_KEYS.SETTINGS, cleanSettings);
}

export async function fetchInstitutionalContent(): Promise<InstitutionalContent> {
  const local = getLocal<InstitutionalContent | null>(STORAGE_KEYS.INSTITUTIONAL, null);
  if (local) {
    return { ...INITIAL_INSTITUTIONAL, ...local };
  }
  setLocal(STORAGE_KEYS.INSTITUTIONAL, INITIAL_INSTITUTIONAL);
  return INITIAL_INSTITUTIONAL;
}

export async function saveInstitutional(content: InstitutionalContent): Promise<void> {
  const cleanContent: InstitutionalContent = {
    ...content,
    updatedAt: new Date().toISOString()
  };
  setLocal(STORAGE_KEYS.INSTITUTIONAL, cleanContent);
}

// ======================= ALIASES PARA RETROCOMPATIBILIDADE =======================

export const saveProductToFirestore = saveProduct;
export const deleteProductFromFirestore = deleteProduct;
export const saveCategoryToFirestore = saveCategory;
export const deleteCategoryFromFirestore = deleteCategory;
export const saveStoreSettingsToFirestore = saveStoreSettings;
export const saveInstitutionalToFirestore = saveInstitutional;

export async function seedInitialFirestoreData(): Promise<void> {
  await fetchCatalogProducts();
  await fetchCategories();
  await fetchStoreSettings();
  await fetchInstitutionalContent();
}

export async function syncLocalDataToFirestore(): Promise<{ count: number }> {
  return { count: 0 };
}
