import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Context } from 'apollo-server-core';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context;
            extra.token = connectionParams['x-jwt'];
          },
        },
      },
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
