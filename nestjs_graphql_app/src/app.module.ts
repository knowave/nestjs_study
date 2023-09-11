import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DataBaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import GraphQLJSON from 'graphql-type-json';
import { Context } from 'apollo-server-core';
import * as Joi from 'joi';
import { FeedModule } from './feed/feed.module';
import { TrainerModule } from './trainer/trainer.module';
import { GymModule } from './gym/gym.module';
import { ReplyModule } from './reply/reply.module';
import { FollowModule } from './follow/follow.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      resolvers: { JSON: GraphQLJSON },
      playground: true,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context;
            extra.token = connectionParams['jwt'];
          },
        },
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    UserModule,
    DataBaseModule,
    FeedModule,
    TrainerModule,
    GymModule,
    ReplyModule,
    FollowModule,
    LikeModule,
  ],
})
export class AppModule {}
