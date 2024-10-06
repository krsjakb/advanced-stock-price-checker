import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StocksService } from './stocks.service';
import { FinnhubService } from './finnhub.service';

describe('StocksService', () => {
  let service: StocksService;
  let finnhubService: FinnhubService;
  let stockRepository: Repository<Stock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: FinnhubService,
          useValue: {
            getCurrentPrice: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Stock),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
    finnhubService = module.get<FinnhubService>(FinnhubService);
    stockRepository = module.get<Repository<Stock>>(getRepositoryToken(Stock));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAndSavePrice', () => {
    it('should fetch price from Finnhub and save to repository', async () => {
      const symbol = 'AAPL';
      const price = 150.0;
      const stockEntity = new Stock();
      stockEntity.symbol = symbol;
      stockEntity.price = price;
      stockEntity.timestamp = new Date();

      jest.spyOn(finnhubService, 'getCurrentPrice').mockResolvedValue(price);
      jest.spyOn(stockRepository, 'create').mockReturnValue(stockEntity);
      jest.spyOn(stockRepository, 'save').mockResolvedValue(stockEntity);

      const result = await service.fetchAndSavePrice(symbol);

      expect(finnhubService.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(stockRepository.create).toHaveBeenCalledWith({
        symbol: symbol.toUpperCase(),
        price,
        timestamp: expect.any(Date),
      });
      expect(stockRepository.save).toHaveBeenCalledWith(stockEntity);
      expect(result).toEqual(stockEntity);
    });
  });

  describe('startTrackingSymbol', () => {
    it('should add symbol to trackedSymbols set', () => {
      const symbol = 'AAPL';
      service.startTrackingSymbol(symbol);
      // Accessing private property via type assertion for testing
      const trackedSymbols = (service as any).trackedSymbols;
      expect(trackedSymbols.has(symbol.toUpperCase())).toBe(true);
    });
  });

  describe('handleCron', () => {
    it('should fetch and save prices for tracked symbols', async () => {
      const symbol = 'AAPL';
      const price = 150.0;
      const stockEntity = new Stock();
      stockEntity.symbol = symbol;
      stockEntity.price = price;
      stockEntity.timestamp = new Date();

      service.startTrackingSymbol(symbol);

      jest.spyOn(finnhubService, 'getCurrentPrice').mockResolvedValue(price);
      jest.spyOn(stockRepository, 'create').mockReturnValue(stockEntity);
      jest.spyOn(stockRepository, 'save').mockResolvedValue(stockEntity);

      // Manually invoke handleCron
      await service.handleCron();

      expect(finnhubService.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(stockRepository.create).toHaveBeenCalled();
      expect(stockRepository.save).toHaveBeenCalled();
    });

    it('should log when no symbols are being tracked', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'debug');
      await service.handleCron();
      expect(loggerSpy).toHaveBeenCalledWith(
        'No symbols are being tracked at the moment.',
      );
    });
  });

  describe('getMovingAverage', () => {
    it('should calculate moving average of last 10 prices', async () => {
      const symbol = 'AAPL';
      const prices = Array.from({ length: 10 }, (_, i) => ({
        symbol,
        price: 100 + i,
        timestamp: new Date(),
      }));

      jest.spyOn(stockRepository, 'find').mockResolvedValue(prices as Stock[]);

      const result = await service.getMovingAverage(symbol);

      const expectedAverage =
        prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

      expect(stockRepository.find).toHaveBeenCalledWith({
        where: { symbol: symbol.toUpperCase() },
        order: { timestamp: 'DESC' },
        take: 10,
      });
      expect(result).toBe(expectedAverage);
    });

    it('should throw error if not enough data', async () => {
      const symbol = 'AAPL';
      jest.spyOn(stockRepository, 'find').mockResolvedValue([]);

      await expect(service.getMovingAverage(symbol)).rejects.toThrow(
        'Not enough data to calculate moving average',
      );
    });
  });

  describe('getCurrentPrice', () => {
    it('should return the latest stock price', async () => {
      const symbol = 'AAPL';
      const stockEntity = new Stock();
      stockEntity.symbol = symbol;
      stockEntity.price = 150.0;
      stockEntity.timestamp = new Date();

      jest.spyOn(stockRepository, 'findOne').mockResolvedValue(stockEntity);

      const result = await service.getCurrentPrice(symbol);

      expect(stockRepository.findOne).toHaveBeenCalledWith({
        where: { symbol: symbol.toUpperCase() },
        order: { timestamp: 'DESC' },
      });
      expect(result).toEqual(stockEntity);
    });

    it('should throw error if stock not found', async () => {
      const symbol = 'AAPL';
      jest.spyOn(stockRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.getCurrentPrice(symbol)).rejects.toThrow(
        'Stock not found',
      );
    });
  });
});
