import { AccountService } from '@/modules/ledger/providers/account/account.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AccountResponse } from '../dto/AccountResponse.dto';
import { CreateAccountPayload } from '../dto/CreateAccountPayload.dto';
import { GetAccountPayload } from '../dto/GetAccountPayload.dto';

@Controller({ path: 'accounts' })
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  @HttpCode(200)
  public async create(
    @Body() body: CreateAccountPayload,
  ): Promise<AccountResponse> {
    return this.accountService.create(body);
  }

  @Get(':id')
  @HttpCode(200)
  public async get(
    @Param() { id }: GetAccountPayload,
  ): Promise<AccountResponse | null> {
    const account = this.accountService.getById(id);

    if (!account) {
      throw new NotFoundException(`Account with id "${id}" cannot be found`);
    }

    return account;
  }
}
