import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'stock_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    StocksModule,
  ],
})
export class AppModule {}
