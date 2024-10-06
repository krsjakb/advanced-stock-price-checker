import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SymbolParamDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z:]+$/, {
    message: 'Symbol must contain only letters and colons',
  })
  symbol: string;
}
