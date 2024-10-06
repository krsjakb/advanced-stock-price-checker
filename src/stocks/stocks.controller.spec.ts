import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { Stock } from './entities/stock.entity';

describe('StocksController', () => {
  let controller: StocksController;
  let service: StocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [
        {
          provide: StocksService,
          useValue: {
            fetchAndSavePrice: jest.fn(),
            startTrackingSymbol: jest.fn(),
            getCurrentPrice: jest.fn(),
            getMovingAverage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StocksController>(StocksController);
    service = module.get<StocksService>(StocksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPrice', () => {
    it('should fetch and save price for given symbol', async () => {
      const symbol = 'AAPL';
      const stockEntity = new Stock();
      stockEntity.symbol = symbol;
      stockEntity.price = 150.0;
      stockEntity.timestamp = new Date();

      jest.spyOn(service, 'fetchAndSavePrice').mockResolvedValue(stockEntity);

      const result = await controller.fetchPrice({ symbol });

      expect(service.fetchAndSavePrice).toHaveBeenCalledWith(symbol);
      expect(result).toEqual(stockEntity);
    });
  });

  describe('startTracking', () => {
    it('should start tracking the given symbol', () => {
      const symbol = 'AAPL';
      const result = controller.startTracking({ symbol });

      expect(service.startTrackingSymbol).toHaveBeenCalledWith(symbol);
      expect(result).toEqual({
        message: `Started tracking ${symbol.toUpperCase()}`,
      });
    });
  });

  describe('getStockInfo', () => {
    it('should return stock info including moving average', async () => {
      const symbol = 'AAPL';
      const stockEntity = new Stock();
      stockEntity.symbol = symbol;
      stockEntity.price = 150.0;
      stockEntity.timestamp = new Date();
      const movingAverage = 145.0;

      jest.spyOn(service, 'getCurrentPrice').mockResolvedValue(stockEntity);
      jest.spyOn(service, 'getMovingAverage').mockResolvedValue(movingAverage);

      const result = await controller.getStockInfo({ symbol });

      expect(service.getCurrentPrice).toHaveBeenCalledWith(symbol);
      expect(service.getMovingAverage).toHaveBeenCalledWith(symbol);
      expect(result).toEqual({
        symbol: symbol.toUpperCase(),
        currentPrice: stockEntity.price,
        lastUpdated: stockEntity.timestamp,
        movingAverage,
      });
    });

    it('should handle errors and throw BadRequestException', async () => {
      const symbol = 'AAPL';
      const errorMessage = 'Stock not found';

      jest
        .spyOn(service, 'getCurrentPrice')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.getStockInfo({ symbol })).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getStockInfo({ symbol })).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
