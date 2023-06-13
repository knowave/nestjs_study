import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductDto {
  @Field()
  id?: number;

  @Field()
  title: string;

  @Field(() => Int)
  price: number;
}
