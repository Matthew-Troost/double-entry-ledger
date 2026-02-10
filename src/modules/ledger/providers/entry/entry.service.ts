import { Injectable } from '@nestjs/common';
import { EntryDataAccess } from './entry.dao';
import { CreateEntryArgs, DirectionTotalsResponse } from './types';
import { EntryModel } from '@/modules/database/models/entry.model';
import { sumBy } from 'lodash';

@Injectable()
export class EntryService {
  constructor(private entryDataAccess: EntryDataAccess) {}

  public createMany(args: CreateEntryArgs): EntryModel[] {
    return this.entryDataAccess.createMany(args);
  }

  public getDirectionTotalsByAccountId(id: string): DirectionTotalsResponse {
    /* fetch all the entries for this account */
    const entries = this.entryDataAccess.findByAccountId(id);

    /* sum all the debit entry amounts */
    const debit_total = sumBy(
      entries.filter((entry) => entry.direction === 'debit'),
      (entry) => entry.amount,
    );

    /* sum all the credit entry amounts */
    const credit_total = sumBy(
      entries.filter((entry) => entry.direction === 'credit'),
      (entry) => entry.amount,
    );

    return { debit_total, credit_total };
  }
}
