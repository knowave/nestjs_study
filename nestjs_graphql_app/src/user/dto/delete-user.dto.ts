import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseOutput } from 'src/common/base-output.dto';

@InputType()
export class DeleteUserInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class DeleteUserOutput extends BaseOutput {}
