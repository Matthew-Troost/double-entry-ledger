import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAccountPayload {
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid v4 UUID' })
  public id?: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsNotEmpty()
  @IsIn(['debit', 'credit'], {
    message: 'Direction must be either "debit" or "credit"',
  })
  public direction: 'debit' | 'credit';
}
