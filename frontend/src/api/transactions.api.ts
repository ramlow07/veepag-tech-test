import { Transaction } from '../types/transaction.types';
import client from './client';

export async function getTransactionsBySubscription(subscriptionId: string): Promise<Transaction[]> {
  const { data } = await client.get<Transaction[]>(`/transactions/subscription/${subscriptionId}`);
  return data;
}
