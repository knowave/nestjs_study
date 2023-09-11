import { Test, TestingModule } from '@nestjs/testing';
import { TrainerResolver } from './trainer.resolver';
import { TrainerService } from './trainer.service';

describe('TrainerResolver', () => {
  let resolver: TrainerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainerResolver, TrainerService],
    }).compile();

    resolver = module.get<TrainerResolver>(TrainerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
