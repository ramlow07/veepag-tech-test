import type { Subscription } from "../../types/subscription.types";
import type {
  SubscriptionsAction,
  SubscriptionsState,
} from "./subscriptions.types";

export const initialState: SubscriptionsState = { status: "idle" };

function replaceSubscription(
  list: Subscription[],
  updated: Subscription,
): Subscription[] {
  return list.map((s) => (s._id === updated._id ? updated : s));
}

export function subscriptionsReducer(
  state: SubscriptionsState,
  action: SubscriptionsAction,
): SubscriptionsState {
  switch (action.type) {
    case "SEARCH":
      return { status: "loading", cpf: action.cpf };

    case "LOADED":
      if (state.status !== "loading") return state;
      return {
        status: "loaded",
        cpf: state.cpf,
        subscriptions: action.subscriptions,
      };

    case "ERROR":
      if (state.status !== "loading") return state;
      return { status: "error", message: action.message, cpf: state.cpf };

    case "CANCEL":
      if (state.status !== "loaded") return state;
      return {
        status: "cancelling",
        cpf: state.cpf,
        subscriptions: state.subscriptions,
        cancellingId: action.subscriptionId,
      };

    case "CANCELLED":
      if (state.status !== "cancelling") return state;
      return {
        status: "loaded",
        cpf: state.cpf,
        subscriptions: replaceSubscription(
          state.subscriptions,
          action.subscription,
        ),
      };

    case "CANCEL_ERROR":
      if (state.status !== "cancelling") return state;
      return {
        status: "loaded",
        cpf: state.cpf,
        subscriptions: state.subscriptions,
        cancelError: action.message,
      };

    default:
      return state;
  }
}
