import { Response } from 'express';
import {
  InvalidEntriesError,
  TransactionAlreadyExistsError,
} from '@/modules/ledger/providers/transaction/errors';
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import { AccountAlreadyExistsError } from '@/modules/ledger/providers/account/errors';
import { AccountNotFoundError } from '@/common/errors';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    if (notFoundErrors.some((error) => exception instanceof error)) {
      return response.status(404).json({
        statusCode: 404,
        message: exception.message,
      });
    }

    if (badRequestErrors.some((error) => exception instanceof error)) {
      return response.status(400).json({
        statusCode: 400,
        message: exception.message,
      });
    }

    if (conflictErrors.some((error) => exception instanceof error)) {
      return response.status(409).json({
        statusCode: 409,
        message: exception.message,
      });
    }

    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}

const notFoundErrors = [NotFoundException];
const conflictErrors = [
  TransactionAlreadyExistsError,
  AccountAlreadyExistsError,
];
const badRequestErrors = [InvalidEntriesError, AccountNotFoundError];
