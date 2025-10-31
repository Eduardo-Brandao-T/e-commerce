import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateCustomerDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(11)
  document: string;
}
