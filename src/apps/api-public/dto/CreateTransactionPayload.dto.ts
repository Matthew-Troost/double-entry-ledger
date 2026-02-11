import { MaxTwoDecimalsConstraint } from '@/common/validators/max-decimals-constraint.validator';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';

class EntryPayload {
  @IsNotEmpty()
  @IsUUID('4', { message: '"account_id" must be a valid v4 UUID' })
  public account_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: '"amount" must be a minimum of 0.01' })
  @Validate(MaxTwoDecimalsConstraint)
  public amount: number;

  @IsNotEmpty()
  @IsIn(['debit', 'credit'], {
    message: `"direction" must be either 'debit' or 'credit'`,
  })
  public direction: 'debit' | 'credit';
}

export class CreateTransactionPayload {
  @IsOptional()
  @IsUUID('4', { message: '"id" must be a valid v4 UUID' })
  public id?: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsArray({ message: '"entries" must not be an array of objects' })
  @ArrayNotEmpty({ message: '"entries" must not be empty' })
  @ValidateNested({ each: true })
  @Type(() => EntryPayload)
  public entries: EntryPayload[];
}
