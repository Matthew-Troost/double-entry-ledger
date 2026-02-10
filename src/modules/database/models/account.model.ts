export interface AccountModel {
  id: string;
  name?: string;
  direction: 'debit' | 'credit';
  /* Read-only by convention. Derived from ledger entries */
  balance: number;
}
