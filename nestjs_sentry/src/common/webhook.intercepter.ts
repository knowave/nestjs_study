import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/client';
import { Observable, catchError, of } from 'rxjs';

@Injectable()
export class WebhookIntercepter implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        Sentry.captureException(err);
        const webhook = new IncomingWebhook(process.env.SLACK_URL);
        webhook.send({
          attachments: [
            {
              color: 'danger',
              text: '에러 발생!',
              fields: [
                {
                  title: `Request Error Message: ${err.message}`,
                  value: err.stack,
                  short: false,
                },
              ],
              ts: Math.floor(new Date().getTime() / 1000).toString(),
            },
          ],
        });
        return of(err);
      }),
    );
  }
}
