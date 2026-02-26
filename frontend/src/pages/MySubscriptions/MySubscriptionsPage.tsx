import { useReducer, useState } from "react";
import { FormEvent } from "react";
import {
  cancelSubscription,
  getSubscriptionsByCpf,
} from "../../api/subscriptions.api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { isValidCpf, maskCpf, stripCpf } from "../../utils/cpf.utils";
import { initialState, subscriptionsReducer } from "./subscriptions.reducer";
import { SubscriptionCard } from "./components/SubscriptionCard";

export function MySubscriptionsPage() {
  const [state, dispatch] = useReducer(subscriptionsReducer, initialState);
  const [cpfInput, setCpfInput] = useState("");
  const [cpfError, setCpfError] = useState("");

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const raw = stripCpf(cpfInput);
    if (!isValidCpf(raw)) {
      setCpfError("CPF inválido. Verifique e tente novamente.");
      return;
    }
    setCpfError("");
    dispatch({ type: "SEARCH", cpf: raw });
    try {
      const data = await getSubscriptionsByCpf(raw);
      dispatch({ type: "LOADED", subscriptions: data });
    } catch (err: unknown) {
      dispatch({ type: "ERROR", message: (err as Error).message });
    }
  }

  async function handleCancel(subscriptionId: string) {
    dispatch({ type: "CANCEL", subscriptionId });
    try {
      const updated = await cancelSubscription(subscriptionId);
      dispatch({ type: "CANCELLED", subscription: updated });
    } catch (err: unknown) {
      dispatch({ type: "CANCEL_ERROR", message: (err as Error).message });
    }
  }

  const searching = state.status === "loading";
  const cancellingId =
    state.status === "cancelling" ? state.cancellingId : null;

  return (
    <main className="page page-enter">
      <div className="section-header">
        <h1>Minhas Assinaturas</h1>
        <p>Consulte e gerencie suas assinaturas pelo CPF.</p>
      </div>

      {/* Search bar */}
      <form className="subs-search" onSubmit={handleSearch}>
        <Input
          label="CPF"
          placeholder="000.000.000-00"
          value={cpfInput}
          onChange={(e) => {
            setCpfInput(maskCpf(e.target.value));
            setCpfError("");
          }}
          error={cpfError}
          inputMode="numeric"
          maxLength={14}
          style={{ maxWidth: 280 }}
        />
        <Button type="submit" variant="primary" loading={searching}>
          Buscar
        </Button>
      </form>

      {/* Cancel error banner */}
      {state.status === "loaded" && state.cancelError && (
        <div
          className="alert alert--danger"
          style={{ marginBottom: 24 }}
          role="alert"
        >
          {state.cancelError}
        </div>
      )}

      {/* Loading skeleton */}
      {state.status === "loading" && (
        <div>
          <div className="skeleton-block" />
          <div className="skeleton-block" />
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="alert alert--danger" role="alert">
          {state.message}
        </div>
      )}

      {/* Empty */}
      {(state.status === "loaded" || state.status === "cancelling") &&
        state.subscriptions.length === 0 && (
          <div
            className="empty-state"
            style={{ textAlign: "left", padding: "40px 0" }}
          >
            <h2 className="empty-state__title">
              Nenhuma assinatura encontrada
            </h2>
            <p className="empty-state__desc">
              Não encontramos assinaturas para o CPF informado.
            </p>
          </div>
        )}

      {/* Subscription list */}
      {(state.status === "loaded" || state.status === "cancelling") &&
        state.subscriptions.length > 0 && (
          <div className="subs-list">
            <p className="subs-list__count">
              {state.subscriptions.length}{" "}
              {state.subscriptions.length === 1
                ? "assinatura encontrada"
                : "assinaturas encontradas"}
            </p>
            {state.subscriptions.map((sub, i) => (
              <div key={sub._id} className="card-enter" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <SubscriptionCard
                  subscription={sub}
                  cancelling={cancellingId === sub._id}
                  onCancel={handleCancel}
                />
              </div>
            ))}
          </div>
        )}
    </main>
  );
}
