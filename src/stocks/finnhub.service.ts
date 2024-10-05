import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FinnhubService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('FINNHUB_API_KEY');
    this.apiUrl = this.configService.get<string>('FINNHUB_API_URL');
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const url = `${this.apiUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;
    const response = this.httpService.get(url).pipe(map((res) => res.data));
    const data = await lastValueFrom(response);
    return data.c;
  }
}
