import { Callback, Context, Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;

async function bootstrapServer(): Promise<Handler> {
  const nestApp = await NestFactory.create(AppModule);
  await nestApp.init();

  const expressApp = nestApp.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrapServer());
  return server(event, context, callback);
};
