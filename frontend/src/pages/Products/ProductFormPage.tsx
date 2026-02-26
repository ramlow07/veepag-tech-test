import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, createProduct, updateProduct } from '../../api/products.api';
import type { CreateProductDto, UpdateProductDto } from '../../api/products.api';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useToast } from '../../components/ui/Toast';
import type { Product } from '../../types/product.types';
import { ProductForm } from './components/ProductForm';

export function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    getProduct(id)
      .then(p => { setProduct(p); setLoading(false); })
      .catch((err: Error) => { setLoadError(err.message); setLoading(false); });
  }, [id, isEdit]);

  async function handleSubmit(dto: CreateProductDto | UpdateProductDto) {
    if (isEdit && id) {
      await updateProduct(id, dto as UpdateProductDto);
      showToast('Produto atualizado com sucesso', 'success');
    } else {
      await createProduct(dto as CreateProductDto);
      showToast('Produto criado com sucesso', 'success');
    }
    navigate('/products');
  }

  if (loading) {
    return (
      <main className="page page-narrow page-enter">
        <div className="skeleton-block" style={{ height: 40, marginBottom: 24 }} />
        <div className="skeleton-block" style={{ height: 56 }} />
        <div className="skeleton-block" style={{ height: 80 }} />
        <div className="skeleton-block skeleton-block--short" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page page-narrow page-enter">
        <div className="alert alert--danger">{loadError}</div>
        <Link to="/products" className="btn-link" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Voltar aos produtos
        </Link>
      </main>
    );
  }

  return (
    <main className="page page-narrow page-enter">
      <Breadcrumb
        items={[
          { label: 'Produtos', to: '/products' },
          { label: isEdit ? 'Editar Produto' : 'Novo Produto' },
        ]}
      />
      <div className="section-header">
        <h1>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h1>
        <p>{isEdit ? 'Atualize as informações do produto.' : 'Preencha as informações para criar um novo produto.'}</p>
      </div>
      <ProductForm
        initialValues={product ?? undefined}
        isEdit={isEdit}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
