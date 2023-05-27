import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cat } from './dto/cat.dto';
import { MyLogger } from 'src/logger/my-logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CatService implements OnApplicationBootstrap {
  private readonly cats: Cat[] = [];

  constructor(private myLogger: MyLogger) {
    this.myLogger.setContext('CatService');
  }

  onApplicationBootstrap() {
    this.findAll();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  findAll(): Cat[] {
    try {
      const findAllCats: Cat[] = [];

      const cat = this.cats.find((cats) => {
        cats.name = 'cat1';
        cats.age = 2;
        cats.breed = 'NO';
      });

      findAllCats.push(cat);

      this.myLogger.customLog();
      return findAllCats;
    } catch (err) {
      this.myLogger.warn(`Cats Not Found : ${err}`);
      console.log(err);
    }
  }
}
