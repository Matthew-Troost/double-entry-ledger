import { Module } from '@nestjs/common';
import { LedgerModule } from '@/modules/ledger/ledger.module';
import { AccountController } from './rest/Account.controller';
import { TransactionController } from './rest/Transaction.controller';

@Module({
  imports: [LedgerModule],
  controllers: [AccountController, TransactionController],
})
export class ApiPublicModule {}
