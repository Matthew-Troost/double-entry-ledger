import { EntryModel } from '@/modules/database/models/entry.model';
import { EntryPayload } from '../entry/types';
import { TransactionModel } from '@/modules/database/models/transaction.model';

export type CreateTransactionArgs = {
  id?: string;
  name?: string;
  entries: EntryPayload[];
};

export type CreateTransactionResponse = TransactionModel & {
  entries: Omit<EntryModel, 'transaction_id'>[];
};
