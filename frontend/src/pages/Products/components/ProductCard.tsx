import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ProductStatus, type Product } from '../../../types/product.types';
import { formatBillingCycle, formatPrice } from '../../../utils/format.utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isActive = product.status === ProductStatus.ACTIVE;

  return (
    <Card className="prod-list-card card-hoverable">
      <div className="prod-list-card__header">
        <div className="prod-list-card__name-row">
          <h3 className="prod-list-card__name">{product.name}</h3>
          <Badge status={product.status} />
        </div>
        <div className="prod-list-card__price-row">
          <span className="sub-card__price">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="sub-card__cycle">
            / {formatBillingCycle(product.billingCycle)}
          </span>
        </div>
      </div>

      {product.description && (
        <p className="prod-list-card__description">{product.description}</p>
      )}

      <div className="prod-list-card__actions">
        {isActive && (
          <Link to={`/checkout/${product._id}`}>
            <Button variant="primary" size="sm">Assinar</Button>
          </Link>
        )}
        <Link to={`/products/${product._id}/edit`} style={{ marginLeft: isActive ? 'auto' : undefined }}>
          <Button variant="secondary" size="sm">Editar</Button>
        </Link>
      </div>
    </Card>
  );
}
