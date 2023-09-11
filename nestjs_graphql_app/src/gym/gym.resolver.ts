import { Resolver } from '@nestjs/graphql';
import { GymService } from './gym.service';

@Resolver()
export class GymResolver {
  constructor(private readonly gymService: GymService) {}
}
