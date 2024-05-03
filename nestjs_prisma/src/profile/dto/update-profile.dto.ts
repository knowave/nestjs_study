import { PartialType } from '@nestjs/swagger';
import { CreateProfile } from './create-profile.dto';

export class UpdateProfile extends PartialType(CreateProfile) {}
