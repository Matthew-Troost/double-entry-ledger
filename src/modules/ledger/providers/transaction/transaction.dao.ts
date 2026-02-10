import { TransactionModel } from '@/modules/database/models/transaction.model';
import { InMemoryStore } from '@/modules/database/providers/InMemoryStore';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionDataAccess {
  constructor(private inMemoryStore: InMemoryStore) {}

  public create(args?: Partial<TransactionModel>): TransactionModel {
    const transaction: TransactionModel = {
      id: crypto.randomUUID(),
      ...(args ?? {}),
    };

    this.inMemoryStore.transactions.push(transaction);

    return transaction;
  }

  public exists(id: string): boolean {
    return this.inMemoryStore.transactions.some(
      (transaction) => transaction.id === id,
    );
  }
}
