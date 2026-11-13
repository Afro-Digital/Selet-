import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SetManualOverrideDto {
  @ApiProperty({ description: 'Currency to override against ETB (USD or EUR)', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  fromCurrency!: string;

  @ApiProperty({
    description: 'Exchange rate (ETB per 1 unit of foreign currency)',
    example: 132.5,
  })
  @IsNumber()
  @Min(0.0001)
  rate!: number;
}
