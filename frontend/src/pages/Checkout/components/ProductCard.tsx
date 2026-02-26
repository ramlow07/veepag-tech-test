import { Card } from "../../../components/ui/Card";
import type { Product } from "../../../types/product.types";
import { formatBillingCycle, formatPrice } from "../../../utils/format.utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="product-card">
      <div className="product-card__header">
        <div>
          <p className="product-card__label">Produto</p>
          <h2 className="product-card__name">{product.name}</h2>
        </div>
        <div className="product-card__price-block">
          <span className="product-card__price">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="product-card__cycle">
            / {formatBillingCycle(product.billingCycle)}
          </span>
        </div>
      </div>
      {product.description && (
        <p className="product-card__description">{product.description}</p>
      )}
    </Card>
  );
}
