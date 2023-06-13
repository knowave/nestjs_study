import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class InputProduct {
  @Field()
  title: string;

  @Field(() => Int)
  price: number;
}
