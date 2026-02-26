import { SubscriptionStatus } from '../../types/subscription.types';
import { TransactionStatus } from '../../types/transaction.types';

type BadgeStatus = SubscriptionStatus | TransactionStatus | string;

interface BadgeProps {
  status: BadgeStatus;
}

const labelMap: Record<string, string> = {
  PENDING:        'Pendente',
  ACTIVE:         'Ativo',
  INACTIVE:       'Inativo',
  PAYMENT_FAILED: 'Falha no Pagamento',
  CANCELLED:      'Cancelado',
  APPROVED:       'Aprovado',
  DECLINED:       'Recusado',
};

const classMap: Record<string, string> = {
  PENDING:        'badge badge--info',
  ACTIVE:         'badge badge--success',
  INACTIVE:       'badge badge--muted',
  PAYMENT_FAILED: 'badge badge--danger',
  CANCELLED:      'badge badge--muted',
  APPROVED:       'badge badge--success',
  DECLINED:       'badge badge--danger',
};

export function Badge({ status }: BadgeProps) {
  return (
    <span className={classMap[status] ?? 'badge badge--muted'}>
      {labelMap[status] ?? status}
    </span>
  );
}
