import { CreateSubscriptionInput, Subscription } from '../types/subscription.types';
import { Transaction } from '../types/transaction.types';
import client from './client';

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<{ subscription: Subscription; transaction: Transaction }> {
  const { data } = await client.post<{ subscription: Subscription; transaction: Transaction }>(
    '/subscriptions',
    input,
  );
  return data;
}

export async function getSubscriptionsByCpf(cpf: string): Promise<Subscription[]> {
  const { data } = await client.get<Subscription[]>(`/subscriptions/customer/${cpf}`);
  return data;
}

export async function cancelSubscription(
  id: string,
  cancellationReason?: string,
): Promise<Subscription> {
  const { data } = await client.patch<Subscription>(`/subscriptions/${id}/cancel`, {
    cancellationReason,
  });
  return data;
}
