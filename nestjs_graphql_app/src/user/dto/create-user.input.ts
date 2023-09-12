import { InputType, PartialType, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { BaseOutput } from 'src/common/base-output.dto';

@InputType()
export class CreateUserInput extends PartialType(User) {}

@ObjectType()
export class CreateUserOutput extends BaseOutput {}
