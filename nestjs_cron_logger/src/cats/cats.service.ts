import { Injectable, Logger } from '@nestjs/common';
import { CatDto } from './dto/cat.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CatsService {
  private cats: CatDto[] = [];
  private readonly logger = new Logger(CatsService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  findAll(): CatDto[] {
    try {
      const findAllCats: CatDto[] = [];

      const cats = this.cats.find((cat) => {
        cat.name = 'cat1';
        cat.age = 2;
        cat.breed = 'NO';
      });

      findAllCats.push(cats);

      this.logger.log('Getting All Cats!');
      return findAllCats;
    } catch (err) {
      this.logger.warn(`Cats Not Found: ${err}`);
    }
  }
}
