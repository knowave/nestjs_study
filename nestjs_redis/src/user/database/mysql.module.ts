import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from 'env';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: DB_HOST,
        port: 3306,
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        entities: [__dirname + '../../**/entities/**.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*.ts'],
        synchronize: true,
      }),
    }),
  ],
})
export class MysqlModule {}
