import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Product,
  Category,
  Banner,
  StoreSettings,
  InstitutionalPage,
} from '../types';
import {
  getStoreSettings,
  getProducts,
  getCategories,
  getBanners,
  getPages,
  bootstrapStoreIfNeeded,
  DEFAULT_STORE_SETTINGS,
} from '../services/storeService';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  pages: InstitutionalPage[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const StoreContext = createContext<StoreContextType>({
  settings: DEFAULT_STORE_SETTINGS,
  products: [],
  categories: [],
  banners: [],
  pages: [],
  isLoading: true,
  refreshData: async () => {},
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
  currentPath: '/',
  navigate: () => {},
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pages, setPages] = useState<InstitutionalPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Handle URL history popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await bootstrapStoreIfNeeded();
      const [fetchedSettings, fetchedProducts, fetchedCategories, fetchedBanners, fetchedPages] =
        await Promise.all([
          getStoreSettings(),
          getProducts(isAdmin),
          getCategories(isAdmin),
          getBanners(isAdmin),
          getPages(isAdmin),
        ]);

      setSettings(fetchedSettings);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setBanners(fetchedBanners);
      setPages(fetchedPages);
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync document title with settings if on homepage
  useEffect(() => {
    if (currentPath === '/') {
      document.title = settings.seo?.defaultTitle || `${settings.storeName} — Loja Virtual`;
    }
  }, [currentPath, settings]);

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        banners,
        pages,
        isLoading,
        refreshData,
        toasts,
        showToast,
        removeToast,
        currentPath,
        navigate,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm flex items-start justify-between gap-3 transition-all ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : toast.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
