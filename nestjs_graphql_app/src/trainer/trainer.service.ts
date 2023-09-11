import { Injectable } from '@nestjs/common';
import { CreateTrainerInput } from './dto/create-trainer.input';
import { UpdateTrainerInput } from './dto/update-trainer.input';

@Injectable()
export class TrainerService {
  create(createTrainerInput: CreateTrainerInput) {
    return 'This action adds a new trainer';
  }

  findAll() {
    return `This action returns all trainer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trainer`;
  }

  update(id: number, updateTrainerInput: UpdateTrainerInput) {
    return `This action updates a #${id} trainer`;
  }

  remove(id: number) {
    return `This action removes a #${id} trainer`;
  }
}
