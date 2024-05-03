import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateProfile } from './dto/create-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async profile(@CurrentUser() user: User) {
    return this.profileService.profile(user.id);
  }

  @Post()
  async createProfile(
    @Body() createProfile: CreateProfile,
    @CurrentUser() user: User,
  ) {
    return this.profileService.createProfile(createProfile, user.id);
  }
}
