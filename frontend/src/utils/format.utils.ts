import { BillingCycle } from '../types/product.types';
import { FailureReason } from '../types/transaction.types';

/** Format price in cents to localised currency string */
export function formatPrice(cents: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Human-readable billing cycle */
export function formatBillingCycle(cycle: BillingCycle): string {
  const labels: Record<BillingCycle, string> = {
    [BillingCycle.MONTHLY]:    'Mensal',
    [BillingCycle.QUARTERLY]:  'Trimestral',
    [BillingCycle.SEMIANNUAL]: 'Semestral',
    [BillingCycle.ANNUAL]:     'Anual',
  };
  return labels[cycle] ?? cycle;
}

/** Format ISO date string to pt-BR locale */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Human-readable failure reason */
export function formatFailureReason(reason: FailureReason | null): string {
  if (!reason) return '—';
  const labels: Record<FailureReason, string> = {
    [FailureReason.INSUFFICIENT_FUNDS]: 'Saldo insuficiente',
    [FailureReason.CARD_EXPIRED]:       'Cartão vencido',
    [FailureReason.DO_NOT_HONOR]:       'Transação não autorizada',
  };
  return labels[reason] ?? reason;
}
