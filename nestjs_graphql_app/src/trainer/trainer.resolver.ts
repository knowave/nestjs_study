import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TrainerService } from './trainer.service';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerInput } from './dto/create-trainer.input';
import { UpdateTrainerInput } from './dto/update-trainer.input';

@Resolver(() => Trainer)
export class TrainerResolver {
  constructor(private readonly trainerService: TrainerService) {}

  @Mutation(() => Trainer)
  createTrainer(@Args('createTrainerInput') createTrainerInput: CreateTrainerInput) {
    return this.trainerService.create(createTrainerInput);
  }

  @Query(() => [Trainer], { name: 'trainer' })
  findAll() {
    return this.trainerService.findAll();
  }

  @Query(() => Trainer, { name: 'trainer' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.trainerService.findOne(id);
  }

  @Mutation(() => Trainer)
  updateTrainer(@Args('updateTrainerInput') updateTrainerInput: UpdateTrainerInput) {
    return this.trainerService.update(updateTrainerInput.id, updateTrainerInput);
  }

  @Mutation(() => Trainer)
  removeTrainer(@Args('id', { type: () => Int }) id: number) {
    return this.trainerService.remove(id);
  }
}
