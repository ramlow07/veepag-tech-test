import type { Product } from "../../types/product.types";
import type { Subscription } from "../../types/subscription.types";
import type { Transaction } from "../../types/transaction.types";

export type CheckoutState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "product_loaded"; product: Product; submitError?: string }
  | { status: "submitting"; product: Product }
  | {
      status: "result";
      product: Product;
      subscription: Subscription;
      transaction: Transaction;
    };

export type CheckoutAction =
  | { type: "PRODUCT_FOUND"; product: Product }
  | { type: "PRODUCT_ERROR"; message: string }
  | { type: "SUBMIT" }
  | {
      type: "SUBMIT_SUCCESS";
      subscription: Subscription;
      transaction: Transaction;
    }
  | { type: "SUBMIT_ERROR"; message: string };

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  cardHolderName: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: string;
  expiryYear: string;
}
