import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { MySubscriptionsPage } from './pages/MySubscriptions/MySubscriptionsPage';

function NavBar() {
  const { pathname } = useLocation();
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
            className={`navbar-link${pathname === '/subscriptions' ? ' navbar-link--active' : ''}`}
          >
            Minhas Assinaturas
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
      <NavBar />
      <Routes>
        <Route path="/checkout/:productId" element={<CheckoutPage />} />
        <Route path="/subscriptions" element={<MySubscriptionsPage />} />
        <Route path="/" element={<Navigate to="/subscriptions" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
