import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Category, StoreSettings, InstitutionalContent } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_INSTITUTIONAL } from '../data/initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with custom firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Aviso: Conexão offline com Firebase Firestore detectada.");
    }
  }
}
testConnection();

// Error Handling conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Admin determination
const ADMIN_EMAILS = ['samuel3266sa@gmail.com'];

export function checkIsAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

// Collection References & Operations
const PRODUCTS_COLL = 'products';
const CATEGORIES_COLL = 'categories';
const SETTINGS_COLL = 'settings';

export async function fetchCatalogProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Seed default catalog to ensure the store never shows an empty broken screen on first visit
      return INITIAL_PRODUCTS;
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.warn("Utilizando produtos padrão locais devido à resposta do Firestore:", error);
    return INITIAL_PRODUCTS;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, CATEGORIES_COLL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return INITIAL_CATEGORIES;
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
  } catch (error) {
    console.warn("Utilizando categorias padrão locais:", error);
    return INITIAL_CATEGORIES;
  }
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLL, 'store_info');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...INITIAL_SETTINGS, ...(snap.data() as StoreSettings) };
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.warn("Utilizando configurações padrão:", error);
    return INITIAL_SETTINGS;
  }
}

export async function fetchInstitutionalContent(): Promise<InstitutionalContent> {
  try {
    const docRef = doc(db, SETTINGS_COLL, 'institutional');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...INITIAL_INSTITUTIONAL, ...(snap.data() as InstitutionalContent) };
    }
    return INITIAL_INSTITUTIONAL;
  } catch (error) {
    console.warn("Utilizando páginas institucionais padrão:", error);
    return INITIAL_INSTITUTIONAL;
  }
}

// Admin write operations
export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLL}/${product.id}`;
  try {
    const cleanProduct = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, PRODUCTS_COLL, product.id), cleanProduct);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLL}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLL, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategoryToFirestore(category: Category): Promise<void> {
  const path = `${CATEGORIES_COLL}/${category.id}`;
  try {
    await setDoc(doc(db, CATEGORIES_COLL, category.id), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const path = `${CATEGORIES_COLL}/${categoryId}`;
  try {
    await deleteDoc(doc(db, CATEGORIES_COLL, categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const path = `${SETTINGS_COLL}/store_info`;
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'store_info'), {
      ...settings,
      id: 'store_info',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveInstitutionalToFirestore(content: InstitutionalContent): Promise<void> {
  const path = `${SETTINGS_COLL}/institutional`;
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'institutional'), {
      ...content,
      id: 'institutional',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Seed initial database if empty when admin logs in
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLL));
    if (productsSnap.empty) {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLL, p.id), p);
      }
    }
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COLL));
    if (categoriesSnap.empty) {
      for (const c of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLL, c.id), c);
      }
    }
    const settingsSnap = await getDoc(doc(db, SETTINGS_COLL, 'store_info'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, SETTINGS_COLL, 'store_info'), {
        ...INITIAL_SETTINGS,
        id: 'store_info',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn("Database auto-seed check:", e);
  }
}
