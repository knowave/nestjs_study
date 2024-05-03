import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateProfile } from './dto/create-profile.dto';
import { Public } from 'src/auth/decorators/is-public.decorator';
import { UpdateProfile } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/:userId')
  @Public()
  async profile(@Param('userId') userId: number) {
    return this.profileService.profile(+userId);
  }

  @Post()
  async createProfile(
    @Body() createProfile: CreateProfile,
    @CurrentUser() user: User,
  ) {
    return this.profileService.createProfile(createProfile, user.id);
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfile: UpdateProfile,
  ) {
    return this.profileService.updateProfile(user.id, updateProfile);
  }
}
