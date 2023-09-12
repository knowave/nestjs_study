import { BaseOutput } from 'src/common/base-output.dto';
import { User } from '../entities/user.entity';
import { InputType, Field, PartialType, ObjectType } from '@nestjs/graphql';

@InputType()
export class EditUserInput extends PartialType(User) {
  @Field(() => Number)
  id: number;
}

@ObjectType()
export class EditUserOutput extends BaseOutput {}
