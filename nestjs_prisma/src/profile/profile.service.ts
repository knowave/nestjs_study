import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './repository/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async profile(userId: number) {
    return this.profileRepository.getProfileByUserId(userId);
  }
}
