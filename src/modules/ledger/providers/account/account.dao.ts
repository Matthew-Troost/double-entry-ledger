import { AccountModel } from '@/modules/database/models/account.model';
import { InMemoryStore } from '@/modules/database/providers/InMemoryStore';
import { Injectable } from '@nestjs/common';
import { CreateAccountArgs } from './types';
import { assign, find } from 'lodash';

@Injectable()
export class AccountDataAccess {
  constructor(private inMemoryStore: InMemoryStore) {}

  public create(args: CreateAccountArgs): AccountModel {
    const account: AccountModel = {
      id: crypto.randomUUID(),
      balance: 0,
      ...args,
    };

    this.inMemoryStore.accounts.push(account);

    return account;
  }

  public update(id: string, entity: Pick<AccountModel, 'balance'>): void {
    const account = find(this.inMemoryStore.accounts, { id });

    if (account) {
      assign(account, entity);
    }
  }

  public findById(id: string): AccountModel | undefined {
    return this.inMemoryStore.accounts.find((account) => account.id === id);
  }

  public exists(id: string): boolean {
    return this.inMemoryStore.accounts.some((account) => account.id === id);
  }

  public notExists(ids: string[]): boolean {
    const existingIds = new Set(this.inMemoryStore.accounts.map((a) => a.id));

    return ids.some((id) => !existingIds.has(id));
  }
}
