/* in a production setup this table would be append-only of immutable objects */
export interface EntryModel {
  id: string;
  direction: 'debit' | 'credit';
  amount: number;
  transaction_id: string;
  account_id: string;
}
