import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupOwnerDto {
  @ApiProperty({
    example: 'Afro Digital Software Solutions',
    description: 'Name of the company or agency',
  })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiProperty({ example: 'owner@afrodigital.dev', description: 'Primary owner email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Admin Owner', description: 'Full name of the owner' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd123',
    description: 'Secure account password (min 8 chars)',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
