import { EntryModel } from '@/modules/database/models/entry.model';
import { TransactionModel } from '@/modules/database/models/transaction.model';

export type TransactionResponse = TransactionModel & {
  entries: Omit<EntryModel, 'transaction_id'>[];
};
