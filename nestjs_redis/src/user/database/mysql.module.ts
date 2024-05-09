import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from 'env';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: DB_HOST,
        port: 3306,
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        entities: ['../../**/entities/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
  ],
})
export class MysqlModule {}
