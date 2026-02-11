import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetAccountPayload {
  @IsNotEmpty()
  @IsUUID('4', { message: '"id" must be a valid v4 UUID' })
  public id: string;
}
