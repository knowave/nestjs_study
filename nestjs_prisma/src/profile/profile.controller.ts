import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateProfile } from './dto/create-profile.dto';
import { Public } from 'src/auth/decorators/is-public.decorator';

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
}
