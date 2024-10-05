import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm';
import { FinnhubService } from './finnhub.service';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private readonly finnhubService: FinnhubService,
  ) {}

  async fetchAndSavePrice(symbol: string): Promise<Stock> {
    const price = await this.finnhubService.getCurrentPrice(symbol);
    const stock = this.stockRepository.create({
      symbol,
      price,
      timestamp: new Date(),
    });
    return this.stockRepository.save(stock);
  }
}
