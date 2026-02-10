import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TransactionService } from '@/modules/ledger/providers/transaction/transaction.service';
import { CreateTransactionPayload } from '../dto/CreateTransactionPayload.dto';
import { TransactionResponse } from '../dto/TransactionResponse.dto';

@Controller({ path: 'transactions' })
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  @HttpCode(200)
  public async create(
    @Body() body: CreateTransactionPayload,
  ): Promise<TransactionResponse> {
    return this.transactionService.create(body);
  }
}
