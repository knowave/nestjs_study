import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class GetHelloInput {
  @Field(() => Number)
  index: number;
}

@ObjectType()
export class GetHelloOutput {
  @Field(() => [String], { nullable: true })
  messages: string[];
}
