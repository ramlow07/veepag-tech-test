import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './components/ui/Toast';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { MySubscriptionsPage } from './pages/MySubscriptions/MySubscriptionsPage';
import { ProductsPage } from './pages/Products';
import { ProductFormPage } from './pages/Products/ProductFormPage';
import { SubscriptionDetailPage } from './pages/SubscriptionDetail';

function NavBar() {
  const { pathname } = useLocation();

  function isActive(prefix: string) {
    return pathname === prefix || pathname.startsWith(prefix + '/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">V</span>
          <span className="navbar-name">eepag</span>
        </Link>
        <nav className="navbar-links">
          <Link
            to="/subscriptions"
            className={`navbar-link${isActive('/subscriptions') ? ' navbar-link--active' : ''}`}
          >
            Assinaturas
          </Link>
          <Link
            to="/products"
            className={`navbar-link${isActive('/products') ? ' navbar-link--active' : ''}`}
          >
            Produtos
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NotFound() {
  return (
    <main className="page-center">
      <div className="empty-state">
        <span className="empty-state__code">404</span>
        <h2 className="empty-state__title">Página não encontrada</h2>
        <p className="empty-state__desc">O endereço acessado não existe.</p>
        <Link to="/" className="btn-link">Voltar ao início</Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <NavBar />
        <Routes>
          <Route path="/checkout/:productId" element={<CheckoutPage />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
          <Route path="/subscriptions" element={<MySubscriptionsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/" element={<Navigate to="/subscriptions" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
