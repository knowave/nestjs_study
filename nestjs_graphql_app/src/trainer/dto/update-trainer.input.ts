import { CreateTrainerInput } from './create-trainer.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTrainerInput extends PartialType(CreateTrainerInput) {
  @Field(() => Int)
  id: number;
}
