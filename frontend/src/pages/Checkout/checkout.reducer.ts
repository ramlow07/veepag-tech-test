import type { CheckoutAction, CheckoutState } from "./checkout.types";

export const initialState: CheckoutState = { status: "loading" };

export function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction,
): CheckoutState {
  switch (action.type) {
    case "PRODUCT_FOUND":
      return { status: "product_loaded", product: action.product };

    case "PRODUCT_ERROR":
      return { status: "error", message: action.message };

    case "SUBMIT":
      if (state.status !== "product_loaded") return state;
      return { status: "submitting", product: state.product };

    case "SUBMIT_SUCCESS":
      if (state.status !== "submitting") return state;
      return {
        status: "result",
        product: state.product,
        subscription: action.subscription,
        transaction: action.transaction,
      };

    case "SUBMIT_ERROR":
      if (state.status !== "submitting") return state;
      // Keep the product loaded so user can retry
      return {
        status: "product_loaded",
        product: state.product,
        submitError: action.message,
      };

    default:
      return state;
  }
}
