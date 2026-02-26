import { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../../api/products.api";
import { createSubscription } from "../../api/subscriptions.api";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { TransactionStatus } from "../../types/transaction.types";
import {
  formatDate,
  formatFailureReason,
  formatPrice,
} from "../../utils/format.utils";
import { checkoutReducer, initialState } from "./checkout.reducer";
import type { CheckoutFormData } from "./checkout.types";
import { CheckoutForm } from "./components/CheckoutForm";
import { ProductCard } from "./components/ProductCard";

export function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  useEffect(() => {
    if (!productId) {
      dispatch({
        type: "PRODUCT_ERROR",
        message: "ID do produto não informado na URL.",
      });
      return;
    }
    getProduct(productId)
      .then((product) => dispatch({ type: "PRODUCT_FOUND", product }))
      .catch((err: Error) =>
        dispatch({ type: "PRODUCT_ERROR", message: err.message }),
      );
  }, [productId]);

  async function handleSubmit(data: CheckoutFormData) {
    if (state.status !== "product_loaded") return;
    dispatch({ type: "SUBMIT" });
    try {
      const result = await createSubscription({
        productId: state.product._id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerCpf: data.customerCpf,
        paymentDetails: {
          cardHolderName: data.cardHolderName,
          cardLastFour: data.cardLastFour,
          cardBrand: data.cardBrand,
          expiryMonth: Number(data.expiryMonth),
          expiryYear: Number(data.expiryYear),
        },
      });
      dispatch({ type: "SUBMIT_SUCCESS", ...result });
    } catch (err: unknown) {
      dispatch({ type: "SUBMIT_ERROR", message: (err as Error).message });
    }
  }

  /* ── Loading ── */
  if (state.status === "loading") {
    return (
      <main className="page page-narrow page-enter">
        <div className="skeleton-block" />
        <div className="skeleton-block skeleton-block--short" />
      </main>
    );
  }

  /* ── Product fetch error ── */
  if (state.status === "error") {
    return (
      <main className="page page-narrow page-center">
        <div className="empty-state">
          <span className="empty-state__code">!</span>
          <h2 className="empty-state__title">Produto indisponível</h2>
          <p className="empty-state__desc">{state.message}</p>
          <Link to="/subscriptions" className="btn-link">
            Ver minhas assinaturas
          </Link>
        </div>
      </main>
    );
  }

  /* ── Result (approved or declined) ── */
  if (state.status === "result") {
    const approved = state.transaction.status === TransactionStatus.APPROVED;
    return (
      <main className="page page-narrow page-enter">
        <Card
          className={`result-card result-card--${approved ? "approved" : "declined"}`}
        >
          <div className="result-card__icon">{approved ? "✓" : "✕"}</div>
          <h2 className="result-card__title">
            {approved ? "Assinatura ativada!" : "Pagamento recusado"}
          </h2>
          <p className="result-card__desc">
            {approved
              ? `Bem-vindo, ${state.subscription.customerName}. Sua assinatura de "${state.product.name}" está ativa.`
              : `O pagamento foi recusado: ${formatFailureReason(state.transaction.failureReason)}. Tente novamente com outro cartão.`}
          </p>
          <div className="result-card__meta">
            <div className="result-meta-row">
              <span>Status</span>
              <Badge status={state.transaction.status} />
            </div>
            <div className="result-meta-row">
              <span>Valor cobrado</span>
              <span className="result-meta-value">
                {formatPrice(
                  state.transaction.amount,
                  state.transaction.currency,
                )}
              </span>
            </div>
            <div className="result-meta-row">
              <span>Processado em</span>
              <span className="result-meta-value">
                {formatDate(state.transaction.processedAt)}
              </span>
            </div>
          </div>
          <Link
            to="/subscriptions"
            className="btn-link"
            style={{ marginTop: 8 }}
          >
            Ver minhas assinaturas →
          </Link>
        </Card>
      </main>
    );
  }

  /* ── Product loaded / submitting ── */
  const product = state.product;
  const submitError =
    state.status === "product_loaded" ? state.submitError : undefined;

  return (
    <main className="page page-narrow page-enter">
      <div className="section-header">
        <h1>Checkout</h1>
        <p>Preencha os dados abaixo para assinar o produto.</p>
      </div>
      <ProductCard product={product} />
      <div style={{ height: 24 }} />
      <CheckoutForm
        onSubmit={handleSubmit}
        submitting={state.status === "submitting"}
        submitError={submitError}
      />
    </main>
  );
}
