import { useEffect, useState } from "react";
import { getTransactionsBySubscription } from "../../../api/transactions.api";
import { Badge } from "../../../components/ui/Badge";
import type { Transaction } from "../../../types/transaction.types";
import {
  formatDate,
  formatFailureReason,
  formatPrice,
} from "../../../utils/format.utils";

interface TransactionHistoryProps {
  subscriptionId: string;
}

export function TransactionHistory({
  subscriptionId,
}: TransactionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    getTransactionsBySubscription(subscriptionId)
      .then((data) => {
        setTransactions(data);
        setFetched(true);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, fetched, subscriptionId]);

  return (
    <div className="tx-history">
      <button
        className="tx-history__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>Histórico de transações</span>
        <span className="tx-history__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="tx-history__body">
          {loading && <p className="tx-history__loading">Carregando...</p>}
          {error && <p className="tx-history__error">{error}</p>}
          {!loading && !error && transactions.length === 0 && (
            <p className="tx-history__empty">Nenhuma transação encontrada.</p>
          )}
          {transactions.map((tx) => (
            <div key={tx._id} className="tx-row">
              <div className="tx-row__left">
                <Badge status={tx.status} />
                {tx.failureReason && (
                  <span className="tx-row__reason">
                    {formatFailureReason(tx.failureReason)}
                  </span>
                )}
              </div>
              <div className="tx-row__right">
                <span className="tx-row__amount">
                  {formatPrice(tx.amount, tx.currency)}
                </span>
                <span className="tx-row__date">
                  {formatDate(tx.processedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
