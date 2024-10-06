import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { FinnhubService } from './finnhub.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);
  private trackedSymbols: Set<string> = new Set();

  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private readonly finnhubService: FinnhubService,
  ) {}

  async fetchAndSavePrice(symbol: string): Promise<Stock> {
    const price = await this.finnhubService.getCurrentPrice(symbol);
    const stock = this.stockRepository.create({
      symbol: symbol.toUpperCase(),
      price,
      timestamp: new Date(),
    });
    return this.stockRepository.save(stock);
  }

  startTrackingSymbol(symbol: string) {
    this.trackedSymbols.add(symbol.toUpperCase());
    this.logger.log(`Started tracking ${symbol.toUpperCase()}`);
  }

  @Cron('*/1 * * * *')
  async handleCron() {
    if (this.trackedSymbols.size === 0) {
      this.logger.debug('No symbols are being tracked at the moment.');
      return;
    }

    this.logger.debug('Cron job started');
    for (const symbol of this.trackedSymbols) {
      try {
        await this.fetchAndSavePrice(symbol);
        this.logger.log(`Fetched and saved price for ${symbol}`);
      } catch (error) {
        this.logger.error(
          `Error fetching price for ${symbol}: ${error.message}`,
        );
      }
    }
    this.logger.debug('Cron job finished');
  }
}
