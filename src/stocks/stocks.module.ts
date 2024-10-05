import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { Stock } from './entities/stock.entity';
import { FinnhubService } from './finnhub.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), HttpModule, ConfigModule],
  controllers: [StocksController],
  providers: [StocksService, FinnhubService],
})
export class StocksModule {}
