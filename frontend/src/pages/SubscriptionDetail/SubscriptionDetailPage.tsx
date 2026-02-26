import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cancelSubscription } from '../../api/subscriptions.api';
import { getTransactionsBySubscription } from '../../api/transactions.api';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import {
  SubscriptionStatus,
  type Subscription,
} from '../../types/subscription.types';
import {
  TransactionStatus,
  type Transaction,
} from '../../types/transaction.types';
import {
  formatBillingCycle,
  formatDate,
  formatFailureReason,
  formatPrice,
} from '../../utils/format.utils';
import { maskCpf } from '../../utils/cpf.utils';

const CANCELLABLE = new Set([SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING]);

// ── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleCopy}
      type="button"
      title="Copiar ID"
    >
      <span>...{value.slice(-8)}</span>
      <span>{copied ? '✓' : '⎘'}</span>
    </button>
  );
}

// ── Transaction Timeline ─────────────────────────────────────────────────────

function TransactionTimeline({ subscriptionId }: { subscriptionId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTransactionsBySubscription(subscriptionId)
      .then(setTransactions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [subscriptionId]);

  if (loading) {
    return (
      <>
        <div className="skeleton-block skeleton-block--short" style={{ marginBottom: 8 }} />
        <div className="skeleton-block skeleton-block--short" style={{ marginBottom: 0 }} />
      </>
    );
  }

  if (error) {
    return <div className="alert alert--danger">{error}</div>;
  }

  if (transactions.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Nenhuma transação encontrada.
      </p>
    );
  }

  return (
    <div className="timeline">
      {transactions.map((tx, i) => {
        const approved = tx.status === TransactionStatus.APPROVED;
        const isLast = i === transactions.length - 1;
        return (
          <div key={tx._id} className="timeline__item">
            {!isLast && <div className="timeline__connector" />}
            <div className={`timeline__dot timeline__dot--${approved ? 'success' : 'danger'}`}>
              {approved ? '✓' : '✕'}
            </div>
            <div className="timeline__body">
              <div className="timeline__header">
                <Badge status={tx.status} />
                <span className="timeline__amount">
                  {formatPrice(tx.amount, tx.currency)}
                </span>
              </div>
              <div className="timeline__date">{formatDate(tx.processedAt)}</div>
              {tx.failureReason && (
                <div className="timeline__reason">
                  {formatFailureReason(tx.failureReason)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function SubscriptionDetailPage() {
  const location = useLocation();
  const { showToast } = useToast();

  const [sub, setSub] = useState<Subscription | undefined>(
    location.state?.subscription as Subscription | undefined,
  );
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!sub) {
    return (
      <main className="page-center">
        <div className="empty-state">
          <span className="empty-state__code">!</span>
          <h2 className="empty-state__title">Assinatura não encontrada</h2>
          <p className="empty-state__desc">
            Acesse esta página a partir da lista de assinaturas.
          </p>
          <Link to="/subscriptions" className="btn-link">
            ← Voltar às assinaturas
          </Link>
        </div>
      </main>
    );
  }

  const snap = sub.productSnapshot;
  const canCancel = CANCELLABLE.has(sub.status);

  async function handleCancel() {
    setCancelling(true);
    try {
      const updated = await cancelSubscription(sub!._id);
      setSub(updated);
      showToast('Assinatura cancelada com sucesso.', 'success');
      setConfirming(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao cancelar', 'error');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <main className="page page-enter">
      <Breadcrumb
        items={[
          { label: 'Assinaturas', to: '/subscriptions' },
          { label: sub.customerName },
        ]}
      />

      <div className="page-toolbar">
        <h1>{snap.name}</h1>
        <Badge status={sub.status} />
      </div>

      {/* Info grid */}
      <div className="detail-grid">
        <Card>
          <p className="detail-card__label">Cliente</p>
          <div className="sub-card__meta" style={{ marginBottom: 0 }}>
            <div className="sub-meta-row">
              <span className="sub-meta-label">Nome</span>
              <span className="sub-meta-value">{sub.customerName}</span>
            </div>
            <div className="sub-meta-row">
              <span className="sub-meta-label">E-mail</span>
              <span className="sub-meta-value">{sub.customerEmail}</span>
            </div>
            <div className="sub-meta-row">
              <span className="sub-meta-label">CPF</span>
              <span className="sub-meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                {maskCpf(sub.customerCpf)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <p className="detail-card__label">Assinatura</p>
          <div className="sub-card__meta" style={{ marginBottom: 0 }}>
            <div className="sub-meta-row">
              <span className="sub-meta-label">ID</span>
              <CopyButton value={sub._id} />
            </div>
            <div className="sub-meta-row">
              <span className="sub-meta-label">Criada em</span>
              <span className="sub-meta-value">{formatDate(sub.createdAt)}</span>
            </div>
            {sub.cancelledAt && (
              <div className="sub-meta-row">
                <span className="sub-meta-label">Cancelada em</span>
                <span className="sub-meta-value">{formatDate(sub.cancelledAt)}</span>
              </div>
            )}
            {sub.cancellationReason && (
              <div className="sub-meta-row">
                <span className="sub-meta-label">Motivo</span>
                <span className="sub-meta-value">{sub.cancellationReason}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Product snapshot */}
      <Card style={{ marginBottom: 16 }}>
        <p className="detail-card__label">Produto contratado</p>
        <div className="product-card__header">
          <div>
            <h3 className="product-card__name" style={{ fontSize: '1.125rem' }}>{snap.name}</h3>
          </div>
          <div className="product-card__price-block">
            <span className="product-card__price">{formatPrice(snap.price, snap.currency)}</span>
            <span className="product-card__cycle">/ {formatBillingCycle(snap.billingCycle)}</span>
          </div>
        </div>
      </Card>

      {/* Cancel action */}
      {canCancel && (
        <div className="detail-cancel" style={{ marginBottom: 24 }}>
          {confirming ? (
            <>
              <span className="detail-cancel__text">Confirma o cancelamento desta assinatura?</span>
              <Button
                variant="danger"
                size="sm"
                loading={cancelling}
                onClick={handleCancel}
              >
                Sim, cancelar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Não
              </Button>
            </>
          ) : (
            <>
              <span className="detail-cancel__text" style={{ color: 'var(--text-secondary)' }}>
                Deseja cancelar esta assinatura?
              </span>
              <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
                Cancelar assinatura
              </Button>
            </>
          )}
        </div>
      )}

      {/* Transaction timeline */}
      <p className="section-label">Histórico de transações</p>
      <TransactionTimeline subscriptionId={sub._id} />
    </main>
  );
}
