import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { FinnhubService } from './finnhub.service';

describe('FinnhubService', () => {
  let service: FinnhubService;
  let httpService: HttpService;
  let configService: ConfigService;

  let mockHeaders: AxiosHeaders;
  let mockConfig: InternalAxiosRequestConfig<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinnhubService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FINNHUB_API_KEY') return 'test_api_key';
              if (key === 'FINNHUB_API_URL') return 'https://finnhub.io/api/v1';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FinnhubService>(FinnhubService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    mockHeaders = new AxiosHeaders();

    mockConfig = {
      headers: mockHeaders,
      method: 'get',
      url: `${configService.get('FINNHUB_API_URL')}/quote`,
      params: {
        symbol: '',
        token: configService.get('FINNHUB_API_KEY'),
      },
      transformRequest: [],
      transformResponse: [],
      timeout: 0,
      xsrfCookieName: '',
      xsrfHeaderName: '',
      transitional: undefined,
      signal: undefined,
      responseType: 'json',
      responseEncoding: 'utf8',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      env: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentPrice', () => {
    it('should return current price for a given symbol', async () => {
      const symbol = 'AAPL';
      const price = 150.0;

      mockConfig.params.symbol = symbol;

      const mockResponse: AxiosResponse<any, any> = {
        data: {
          c: price,
        },
        status: 200,
        statusText: 'OK',
        headers: mockHeaders,
        config: mockConfig,
        request: {},
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service.getCurrentPrice(symbol);

      expect(httpService.get).toHaveBeenCalledWith(
        `${configService.get('FINNHUB_API_URL')}/quote`,
        {
          params: {
            symbol,
            token: configService.get('FINNHUB_API_KEY'),
          },
        },
      );
      expect(result).toBe(price);
    });

    it('should throw an error if API returns null data', async () => {
      const symbol = 'AAPL';

      mockConfig.params.symbol = symbol;

      const mockResponse: AxiosResponse<any, any> = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: mockHeaders,
        config: mockConfig,
        request: {},
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      await expect(service.getCurrentPrice(symbol)).rejects.toThrow(
        `No data returned for symbol ${symbol}`,
      );
    });

    it('should throw an error if API returns null current price', async () => {
      const symbol = 'AAPL';

      mockConfig.params.symbol = symbol;

      const mockResponse: AxiosResponse<any, any> = {
        data: {
          c: null,
        },
        status: 200,
        statusText: 'OK',
        headers: mockHeaders,
        config: mockConfig,
        request: {},
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      await expect(service.getCurrentPrice(symbol)).rejects.toThrow(
        `No data returned for symbol ${symbol}`,
      );
    });
  });
});
