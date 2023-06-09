import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { CatsRepository } from 'src/cats/cats.repository';
import { CatsService } from 'src/cats/cats.service';
import { Cats } from 'src/cats/entities/cats.entity';

@Injectable()
export class CatsFatory {
  constructor(private readonly repository: CatsRepository) {}

  async createCat(cats?: Cats): Promise<Cats> {
    cats = new Cats();
    cats.name = faker.animal.cat();
    return this.repository.save(cats);
  }

  async createBaseCats(): Promise<Cats> {
    const cats: any[] = [];
    const cat: Cats = new Cats();

    cat.name = faker.animal.cat();

    const savedCats = await this.repository.save(cat);
    for (let i = 0; i < 10; i++) {
      cats.push(await this.createCat(savedCats));
    }

    return savedCats;
  }
}
