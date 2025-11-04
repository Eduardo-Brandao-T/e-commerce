import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class CreateUserDTO {
  @ApiProperty({
    example: 'Eduardo Brandão',
    description: 'Nome completo do usuário',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'eduardo@email.com',
    description: 'E-mail do usuário, deve ser único e válido',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (entre 6 e 20 caracteres)',
  })
  @IsString()
  @Length(6, 20)
  password: string;

  @ApiProperty({
    example: '12345678912',
    description: 'Documento (CPF com 11 dígitos ou CNPJ com 14 dígitos)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: MESSAGES.CUSTOMER.INVALID_DOCUMENT_FORMAT,
  })
  document: string;
}
