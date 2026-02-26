import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { Subscription } from "../../../types/subscription.types";
import { SubscriptionStatus } from "../../../types/subscription.types";
import {
  formatBillingCycle,
  formatDate,
  formatPrice,
} from "../../../utils/format.utils";
import { TransactionHistory } from "./TransactionHistory";

interface SubscriptionCardProps {
  subscription: Subscription;
  cancelling: boolean;
  onCancel: (id: string) => void;
}

const CANCELLABLE = new Set([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PENDING,
]);

export function SubscriptionCard({
  subscription,
  cancelling,
  onCancel,
}: SubscriptionCardProps) {
  const [confirming, setConfirming] = useState(false);
  const { productSnapshot: snap } = subscription;
  const canCancel = CANCELLABLE.has(subscription.status);

  function handleCancelClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onCancel(subscription._id);
  }

  return (
    <Card className="sub-card">
      {/* Header */}
      <div className="sub-card__header">
        <div className="sub-card__title-row">
          <h3 className="sub-card__name">{snap.name}</h3>
          <Badge status={subscription.status} />
        </div>
        <div className="sub-card__price-row">
          <span className="sub-card__price">
            {formatPrice(snap.price, snap.currency)}
          </span>
          <span className="sub-card__cycle">
            / {formatBillingCycle(snap.billingCycle)}
          </span>
        </div>
      </div>

      <div className="divider" style={{ margin: "16px 0" }} />

      {/* Meta */}
      <div className="sub-card__meta">
        <div className="sub-meta-row">
          <span className="sub-meta-label">Cliente</span>
          <span className="sub-meta-value">{subscription.customerName}</span>
        </div>
        <div className="sub-meta-row">
          <span className="sub-meta-label">E-mail</span>
          <span className="sub-meta-value">{subscription.customerEmail}</span>
        </div>
        <div className="sub-meta-row">
          <span className="sub-meta-label">Criada em</span>
          <span className="sub-meta-value">
            {formatDate(subscription.createdAt)}
          </span>
        </div>
        {subscription.cancelledAt && (
          <div className="sub-meta-row">
            <span className="sub-meta-label">Cancelada em</span>
            <span className="sub-meta-value">
              {formatDate(subscription.cancelledAt)}
            </span>
          </div>
        )}
        {subscription.cancellationReason && (
          <div className="sub-meta-row">
            <span className="sub-meta-label">Motivo</span>
            <span className="sub-meta-value">
              {subscription.cancellationReason}
            </span>
          </div>
        )}
      </div>

      <TransactionHistory subscriptionId={subscription._id} />

      {/* Actions */}
      <div className="sub-card__actions">
        {canCancel && (
          <>
            {confirming && (
              <span className="sub-card__confirm-text">
                Confirma o cancelamento?
              </span>
            )}
            <Button
              variant={confirming ? "danger" : "ghost"}
              size="sm"
              loading={cancelling}
              onClick={handleCancelClick}
            >
              {confirming ? "Sim, cancelar" : "Cancelar assinatura"}
            </Button>
            {confirming && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Não
              </Button>
            )}
          </>
        )}
        <Link
          to={`/subscriptions/${subscription._id}`}
          state={{ subscription }}
          className="btn-link"
          style={{ marginLeft: "auto" }}
        >
          Ver detalhes →
        </Link>
      </div>
    </Card>
  );
}
