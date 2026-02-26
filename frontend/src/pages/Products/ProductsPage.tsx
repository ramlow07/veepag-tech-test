import { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/products.api';
import { Button } from '../../components/ui/Button';
import { ProductStatus, type Product } from '../../types/product.types';
import { ProductCard } from './components/ProductCard';

type StatusFilter = 'ALL' | ProductStatus;

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; products: Product[]; total: number };

type FetchAction =
  | { type: 'LOAD' }
  | { type: 'LOADED'; products: Product[]; total: number }
  | { type: 'ERROR'; message: string };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'LOAD':    return { status: 'loading' };
    case 'LOADED':  return { status: 'loaded', products: action.products, total: action.total };
    case 'ERROR':   return { status: 'error', message: action.message };
  }
}

const PAGE_SIZE = 9;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',                   label: 'Todos' },
  { value: ProductStatus.ACTIVE,    label: 'Ativos' },
  { value: ProductStatus.INACTIVE,  label: 'Inativos' },
];

export function ProductsPage() {
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(fetchReducer, { status: 'loading' });

  useEffect(() => {
    dispatch({ type: 'LOAD' });
    const params: { status?: string; page: number; limit: number } = {
      page,
      limit: PAGE_SIZE,
    };
    if (filter !== 'ALL') params.status = filter;

    getProducts(params)
      .then(res => dispatch({ type: 'LOADED', products: res.data, total: res.total }))
      .catch((err: Error) => dispatch({ type: 'ERROR', message: err.message }));
  }, [filter, page]);

  function handleFilterChange(next: StatusFilter) {
    if (next === filter) return;
    setFilter(next);
    setPage(1);
  }

  const totalPages =
    state.status === 'loaded' ? Math.ceil(state.total / PAGE_SIZE) : 1;

  return (
    <main className="page page-enter">
      <div className="page-toolbar">
        <h1>Produtos</h1>
        <Link to="/products/new">
          <Button variant="primary">+ Novo Produto</Button>
        </Link>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-tab${filter === f.value ? ' filter-tab--active' : ''}`}
              onClick={() => handleFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-block" style={{ height: 190, marginBottom: 0 }} />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="alert alert--danger">{state.message}</div>
      )}

      {state.status === 'loaded' && state.products.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'left', padding: '40px 0' }}>
          <h2 className="empty-state__title">Nenhum produto encontrado</h2>
          <p className="empty-state__desc">
            {filter !== 'ALL'
              ? 'Tente outro filtro ou crie um novo produto.'
              : 'Crie seu primeiro produto para começar.'}
          </p>
        </div>
      )}

      {state.status === 'loaded' && state.products.length > 0 && (
        <>
          <div className="products-grid">
            {state.products.map((p, i) => (
              <div key={p._id} className={`card-enter`} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Anterior
              </Button>
              <span className="pagination__info">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
