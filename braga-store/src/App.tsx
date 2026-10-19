import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailPage } from './pages/public/CategoryDetailPage';
import { OffersPage } from './pages/public/OffersPage';
import { ContactPage } from './pages/public/ContactPage';
import { DeliveryTermsPage } from './pages/public/DeliveryTermsPage';
import { InstitutionalPageView } from './pages/public/InstitutionalPageView';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Area
import { AdminLayout } from './pages/admin/AdminLayout';

const AppRouter: React.FC = () => {
  const { currentPath } = useStore();

  // 1. Admin Routing
  if (currentPath.startsWith('/admin')) {
    return <AdminLayout />;
  }

  // 2. Public Store Routing
  const renderPublicPage = () => {
    // Homepage
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />;
    }

    // Catalog: /produtos
    if (currentPath === '/produtos' || currentPath.startsWith('/produtos?')) {
      return <CatalogPage />;
    }

    // Product Detail: /produto/:slugOrId
    if (currentPath.startsWith('/produto/')) {
      const slugOrId = currentPath.replace('/produto/', '').split('?')[0];
      return <ProductDetailPage slugOrId={slugOrId} />;
    }

    // Categories: /categorias
    if (currentPath === '/categorias') {
      return <CategoriesPage />;
    }

    // Category Detail: /categoria/:slug
    if (currentPath.startsWith('/categoria/')) {
      const slug = currentPath.replace('/categoria/', '').split('?')[0];
      return <CategoryDetailPage slug={slug} />;
    }

    // Offers: /ofertas
    if (currentPath === '/ofertas') {
      return <OffersPage />;
    }

    // Contact: /contato
    if (currentPath === '/contato') {
      return <ContactPage />;
    }

    // Prazo de Entrega: /prazo-entrega
    if (currentPath === '/prazo-entrega') {
      return <DeliveryTermsPage />;
    }

    // About Shortcut: /sobre
    if (currentPath === '/sobre') {
      return <InstitutionalPageView slug="sobre" />;
    }

    // Institutional Pages: /pagina/:slug
    if (currentPath.startsWith('/pagina/')) {
      const slug = currentPath.replace('/pagina/', '').split('?')[0];
      return <InstitutionalPageView slug={slug} />;
    }

    // 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header />
      <main className="flex-1">{renderPublicPage()}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </AuthProvider>
  );
}
