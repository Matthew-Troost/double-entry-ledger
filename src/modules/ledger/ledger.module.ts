import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AccountDataAccess } from './providers/account/account.dao';
import { AccountService } from './providers/account/account.service';
import { TransactionService } from './providers/transaction/transaction.service';
import { TransactionDataAccess } from './providers/transaction/transaction.dao';
import { EntryDataAccess } from './providers/entry/entry.dao';
import { EntryService } from './providers/entry/entry.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    AccountService,
    AccountDataAccess,
    TransactionService,
    TransactionDataAccess,
    EntryService,
    EntryDataAccess,
  ],
  exports: [AccountService, TransactionService],
})
export class LedgerModule {}
