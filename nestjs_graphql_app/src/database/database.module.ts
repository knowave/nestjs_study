import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '../../**/entities/**.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*.ts'],
        subscribers: [__dirname + '/subscribers/*.ts'],
        synchronize: false,
        migrationsRun: true,
        charset: 'utf8mb4_unicode_ci',
      }),
    }),
  ],
})
export class DataBaseModule {}
