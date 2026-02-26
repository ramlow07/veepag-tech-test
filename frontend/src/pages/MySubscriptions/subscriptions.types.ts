import type { Subscription } from "../../types/subscription.types";

export type SubscriptionsState =
  | { status: "idle" }
  | { status: "loading"; cpf: string }
  | {
      status: "loaded";
      cpf: string;
      subscriptions: Subscription[];
      cancelError?: string;
    }
  | {
      status: "cancelling";
      cpf: string;
      subscriptions: Subscription[];
      cancellingId: string;
    }
  | { status: "error"; message: string; cpf: string };

export type SubscriptionsAction =
  | { type: "SEARCH"; cpf: string }
  | { type: "LOADED"; subscriptions: Subscription[] }
  | { type: "ERROR"; message: string }
  | { type: "CANCEL"; subscriptionId: string }
  | { type: "CANCELLED"; subscription: Subscription }
  | { type: "CANCEL_ERROR"; message: string };
