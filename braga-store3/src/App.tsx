import React, { useState, useEffect, useCallback } from 'react';
import { 
  isAdminAuthenticated, 
  fetchCatalogProducts, 
  fetchCategories, 
  fetchStoreSettings, 
  fetchInstitutionalContent
} from './lib/storage';
import { Product, Category, StoreSettings, InstitutionalContent, ViewRoute } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_INSTITUTIONAL } from './data/initialData';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { CatalogView } from './components/catalog/CatalogView';
import { ProductDetail } from './components/catalog/ProductDetail';
import { InstitutionalView } from './components/institutional/InstitutionalView';
import { AdminPanel } from './components/admin/AdminPanel';
import { PackageX, ArrowLeft } from 'lucide-react';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => isAdminAuthenticated());
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [institutional, setInstitutional] = useState<InstitutionalContent>(INITIAL_INSTITUTIONAL);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Parse initial route from browser URL/path or hash
  const parseCurrentUrlRoute = (): ViewRoute => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    if (path.startsWith('/admin') || hash.startsWith('#admin')) {
      return { type: 'admin' };
    }
    if (path.startsWith('/produto/') || hash.startsWith('#produto/')) {
      const slug = path.startsWith('/produto/') 
        ? path.replace('/produto/', '') 
        : hash.replace('#produto/', '');
      return { type: 'product', slug: slug.split('?')[0].split('/')[0] };
    }
    if (path.startsWith('/produtos') || hash.startsWith('#produtos') || searchParams.has('categoria') || searchParams.has('q')) {
      return { 
        type: 'catalog', 
        category: searchParams.get('categoria') || undefined,
        query: searchParams.get('q') || undefined
      };
    }
    if (path.includes('sobre') || hash.includes('sobre')) return { type: 'institutional', page: 'sobre' };
    if (path.includes('contato') || hash.includes('contato')) return { type: 'institutional', page: 'contato' };
    if (path.includes('privacidade') || hash.includes('privacidade')) return { type: 'institutional', page: 'privacidade' };
    if (path.includes('termos') || hash.includes('termos')) return { type: 'institutional', page: 'termos' };
    if (path.includes('entrega') || hash.includes('entrega')) return { type: 'institutional', page: 'entrega' };
    if (path.includes('trocas') || hash.includes('trocas')) return { type: 'institutional', page: 'trocas' };

    return { type: 'home' };
  };

  const [currentRoute, setCurrentRoute] = useState<ViewRoute>(parseCurrentUrlRoute());

  // Handle URL change navigation
  const navigateTo = (route: ViewRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let newUrl = '/';
    if (route.type === 'home') {
      newUrl = '/';
      document.title = `${settings.storeName} — ${settings.slogan || 'Variedades, Qualidade e Melhores Ofertas'}`;
    } else if (route.type === 'catalog') {
      const params = new URLSearchParams();
      if (route.category) params.set('categoria', route.category);
      if (route.query) params.set('q', route.query);
      const qs = params.toString();
      newUrl = `/produtos${qs ? '?' + qs : ''}`;
      document.title = route.category 
        ? `${route.category.toUpperCase()} — Catálogo ${settings.storeName}` 
        : `Catálogo de Produtos — ${settings.storeName}`;
    } else if (route.type === 'product') {
      newUrl = `/produto/${route.slug}`;
    } else if (route.type === 'institutional') {
      newUrl = `/${route.page}`;
      document.title = `${route.page.toUpperCase()} — ${settings.storeName}`;
    } else if (route.type === 'admin') {
      newUrl = '/admin';
      document.title = `Painel Administrativo — ${settings.storeName}`;
    }

    try {
      window.history.pushState({}, '', newUrl);
    } catch {
      // Fallback for sandboxed iframe
      window.location.hash = newUrl;
    }
  };

  // Sync back/forward browser buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentUrlRoute());
      setIsAdminLoggedIn(isAdminAuthenticated());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Load catalog and store data from local storage
  const loadStoreData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [prods, cats, stts, inst] = await Promise.all([
        fetchCatalogProducts(),
        fetchCategories(),
        fetchStoreSettings(),
        fetchInstitutionalContent()
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(stts);
      setInstitutional(inst);
    } catch (err) {
      console.warn("Carregamento dos dados:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  // Determine current product if on product detail page
  const selectedProduct = currentRoute.type === 'product'
    ? products.find(p => p.slug === currentRoute.slug || p.id === currentRoute.slug)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      
      {/* Header (hidden in admin mode to offer full viewport space to management) */}
      {currentRoute.type !== 'admin' && (
        <Header
          settings={settings}
          categories={categories}
          products={products}
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          isAdminLoggedIn={isAdminLoggedIn}
        />
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {currentRoute.type === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute.type === 'catalog' && (
          <CatalogView
            products={products}
            categories={categories}
            initialCategory={currentRoute.category}
            initialQuery={currentRoute.query}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute.type === 'product' && (
          selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              allProducts={products}
              settings={settings}
              onNavigate={navigateTo}
            />
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <PackageX className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">
                  Produto não encontrado
                </h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  O produto que você procura pode ter sido esgotado, desativado ou o link digitado está incorreto.
                </p>
                <button
                  onClick={() => navigateTo({ type: 'catalog' })}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Explorar outros produtos</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentRoute.type === 'institutional' && (
          <InstitutionalView
            page={currentRoute.page}
            content={institutional}
            settings={settings}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute.type === 'admin' && (
          <AdminPanel
            isAdminLoggedIn={isAdminLoggedIn}
            onAuthChange={setIsAdminLoggedIn}
            products={products}
            categories={categories}
            settings={settings}
            institutional={institutional}
            onRefreshData={loadStoreData}
            onNavigate={navigateTo}
          />
        )}
      </div>

      {/* Footer */}
      {currentRoute.type !== 'admin' && (
        <Footer
          settings={settings}
          onNavigate={navigateTo}
        />
      )}

    </div>
  );
}
