import { Injectable } from '@nestjs/common';
import { AccountDataAccess } from './account.dao';
import { AccountModel } from '@/modules/database/models/account.model';
import { CreateAccountArgs } from './types';
import { EntryService } from '../entry/entry.service';
import { AccountAlreadyExistsError } from './errors';
import { AccountNotFoundError } from '@/common/errors';

@Injectable()
export class AccountService {
  constructor(
    private accountDataAccess: AccountDataAccess,
    private entryService: EntryService,
  ) {}

  public create(args: CreateAccountArgs): AccountModel {
    const { id } = args;

    if (id && this.accountDataAccess.exists(id)) {
      throw new AccountAlreadyExistsError(
        `An account with id "${id}" already exists`,
      );
    }

    return this.accountDataAccess.create(args);
  }

  public getById(id: string): AccountModel | undefined {
    return this.accountDataAccess.findById(id);
  }

  public notExists(ids: string[]): boolean {
    return this.accountDataAccess.notExists(ids);
  }

  /* in production, this method would be called from inside a db transaction 
  and would accept the entity manager to handle db queries and mutations here */
  public recalculateBalance(id: string): void {
    const account = this.getById(id);

    if (!account) {
      throw new AccountNotFoundError(`Account with id "${id}" cannot be found`);
    }

    /* get the debit and credit entry totals for the account */
    const { debit_total, credit_total } =
      this.entryService.getDirectionTotalsByAccountId(id);

    /* determine the balance based on the account direction */
    const balance =
      account.direction === 'debit'
        ? debit_total - credit_total
        : credit_total - debit_total;

    /* update the balance */
    this.accountDataAccess.update(id, { balance });
  }
}
