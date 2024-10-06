import { Controller, Post, Put, Param } from '@nestjs/common';
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
}
