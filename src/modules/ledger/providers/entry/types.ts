export type CreateEntryArgs = {
  transaction_id: string;
  entries: EntryPayload[];
};

export type EntryPayload = {
  account_id: string;
  amount: number;
  direction: 'debit' | 'credit';
};

export type DirectionTotalsResponse = {
  debit_total: number;
  credit_total: number;
};
