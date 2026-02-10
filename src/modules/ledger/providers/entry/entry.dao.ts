import { EntryModel } from '@/modules/database/models/entry.model';
import { InMemoryStore } from '@/modules/database/providers/InMemoryStore';
import { Injectable } from '@nestjs/common';
import { CreateEntryArgs } from './types';
@Injectable()
export class EntryDataAccess {
  constructor(private inMemoryStore: InMemoryStore) {}

  public createMany(args: CreateEntryArgs): EntryModel[] {
    const { transaction_id, entries } = args;

    const populated_entries: EntryModel[] = entries.map((entry) => ({
      id: crypto.randomUUID(),
      transaction_id,
      ...entry,
    }));

    this.inMemoryStore.entries.push(...populated_entries);

    return populated_entries;
  }

  public findByAccountId(id: string): EntryModel[] {
    return this.inMemoryStore.entries.filter(
      (entry) => entry.account_id === id,
    );
  }
}
