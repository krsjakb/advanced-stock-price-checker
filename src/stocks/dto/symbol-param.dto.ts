import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SymbolParamDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z]+$/, { message: 'Symbol must contain only letters' })
  symbol: string;
}
