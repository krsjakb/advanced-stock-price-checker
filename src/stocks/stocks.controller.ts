import {
  Controller,
  Post,
  Put,
  Param,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post(':symbol/fetch')
  async fetchPrice(@Param('symbol') symbol: string) {
    const stock = await this.stocksService.fetchAndSavePrice(symbol);
    return stock;
  }

  @Put(':symbol')
  startTracking(@Param('symbol') symbol: string) {
    this.stocksService.startTrackingSymbol(symbol);
    return { message: `Started tracking ${symbol.toUpperCase()}` };
  }

  @Get(':symbol')
  async getStockInfo(@Param('symbol') symbol: string) {
    try {
      const currentPrice = await this.stocksService.getCurrentPrice(symbol);
      const movingAverage = await this.stocksService.getMovingAverage(symbol);

      return {
        symbol: symbol.toUpperCase(),
        currentPrice: currentPrice.price,
        lastUpdated: currentPrice.timestamp,
        movingAverage,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
