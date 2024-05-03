import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from './repository/profile.repository';
import { NOT_FOUND_PROFILE } from './error/profile.error';
import { CreateProfile } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async profile(userId: number) {
    const profile = await this.profileRepository.getProfileByUserId(userId);

    if (!profile) throw new NotFoundException(NOT_FOUND_PROFILE);

    return profile;
  }

  async createProfile(
    createProfile: CreateProfile,
    userId: number,
  ): Promise<boolean> {
    const { bio } = createProfile;

    await this.profileRepository.save({
      bio,
      userId,
    });

    return true;
  }
}
