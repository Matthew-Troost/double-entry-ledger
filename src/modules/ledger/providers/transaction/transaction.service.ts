import { Injectable } from '@nestjs/common';
import { TransactionDataAccess } from './transaction.dao';
import { EntryService } from '../entry/entry.service';
import { CreateTransactionArgs, CreateTransactionResponse } from './types';
import { AccountService } from '../account/account.service';
import { groupBy, mapValues, omit, sumBy, uniq } from 'lodash';
import { InvalidEntriesError, TransactionAlreadyExistsError } from './errors';
import { AccountNotFoundError } from '@/common/errors';

@Injectable()
export class TransactionService {
  constructor(
    private transactionDataAccess: TransactionDataAccess,
    private accountService: AccountService,
    private entryService: EntryService,
  ) {}

  public create(args: CreateTransactionArgs): CreateTransactionResponse {
    const { entries, ...restArgs } = args;

    this.validateNewTransaction(args);

    /* --------------- START: In production, this block would be wrapped in a database transaction --------------- */

    /* create the transaction record first, as entries will reference it */
    const transaction = this.transactionDataAccess.create(restArgs);

    /* create the entry records */
    const created_entries = this.entryService.createMany({
      transaction_id: transaction.id,
      entries,
    });

    /* recalculate account balances */
    const distinctAccountIds = uniq(entries.map((entry) => entry.account_id));

    for (const accountId of distinctAccountIds) {
      this.accountService.recalculateBalance(accountId);
    }

    /* --------------- END: In production, this block would be wrapped in a database transaction --------------- */

    return {
      ...transaction,
      entries: created_entries.map((entry) => omit(entry, ['transaction_id'])),
    };
  }

  private validateNewTransaction(args: CreateTransactionArgs): void {
    const { id, entries } = args;

    /* 1. ensure all amounts are positive */
    if (entries.some((entry) => entry.amount <= 0)) {
      throw new InvalidEntriesError('Entry amounts must be positive');
    }

    /* 2. ensure the sum of debits equals the sum of credits */
    const debitSum = sumBy(
      entries.filter((entry) => entry.direction === 'debit'),
      (entry) => entry.amount,
    );

    const creditSum = sumBy(
      entries.filter((entry) => entry.direction === 'credit'),
      (entry) => entry.amount,
    );

    if (debitSum !== creditSum) {
      throw new InvalidEntriesError(
        'The sum of debit amounts must equal the sum of credit amounts',
      );
    }

    /* 3. ensure there is only one debit and one credit per account */
    const entriesByAccount = groupBy(entries, (entry) => entry.account_id);

    const entriesByAccountAndDirection = mapValues(
      entriesByAccount,
      (accountEntries) => groupBy(accountEntries, (entry) => entry.direction),
    );

    for (const accountGroups of Object.values(entriesByAccountAndDirection)) {
      for (const directionEntries of Object.values(accountGroups)) {
        if (directionEntries.length > 1) {
          throw new InvalidEntriesError(
            'Only one debit and one credit entry per account is allowed.',
          );
        }
      }
    }

    /* 4. ensure there are at least 2 account id's */
    const distinctAccountIds = uniq(entries.map((entry) => entry.account_id));

    if (distinctAccountIds.length < 2) {
      throw new InvalidEntriesError(
        "A transaction must include entries for at least two different account id's.",
      );
    }

    /* 5. ensure all account id's are valid */
    if (this.accountService.notExists(distinctAccountIds)) {
      throw new AccountNotFoundError(
        "One or more account id's cannot be found",
      );
    }

    /* 6. ensure a given transaction id does not already exist */
    if (id && this.transactionDataAccess.exists(id)) {
      throw new TransactionAlreadyExistsError(
        `A transaction with id "${id}" already exists`,
      );
    }
  }
}
