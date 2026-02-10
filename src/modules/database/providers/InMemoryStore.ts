import { Injectable } from '@nestjs/common';
import { AccountModel } from '../models/account.model';
import { EntryModel } from '../models/entry.model';
import { TransactionModel } from '../models/transaction.model';

@Injectable()
export class InMemoryStore {
  public accounts: AccountModel[] = [];
  public transactions: TransactionModel[] = [];
  public entries: EntryModel[] = [];
}
