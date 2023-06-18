import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 모든 유저 찾기
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 특정 유저 찾기
  findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 유저 삭제
  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // 유저 생성
  async createUser(user: User): Promise<User> {
    await this.userRepository.save(user);
    return user;
  }

  // 특정 사용자 이름 찾기
  async findByUserName(userName: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { userName } });
  }

  // Email 값을 이용한 User 정보 가져오기
  async getByEmail(email: string) {
    const user = this.userRepository.findOne({ where: { email: email } });

    if (user) {
      return user;
    } else {
      throw new HttpException(
        '존재하지 않은 유저입니다.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // 유저 ID 가져오기
  async getById(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (user) {
      return user;
    }

    throw new HttpException('존재하지 않은 유저입니다.', HttpStatus.NOT_FOUND);
  }

  // DB에 발급받은 Refresh Token 암호화 저장
  async setCurrentRefreshToken(refreshToken: string, id: number) {
    const currentHashedRefreshToken = await hash(refreshToken, 10);
    await this.userRepository.update(id, { currentHashedRefreshToken });
  }

  // Id 값을 이용한 Refresh Token 유효한지 확인
  async getUserIfRefreshTokenMatches(refreshToken: string, id: number) {
    const user = await this.getById(id);

    const isRefreshTokenMatching = await compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  // Refresh Token 초기화
  async removeRefreshToken(id: number) {
    return this.userRepository.update(id, {
      currentHashedRefreshToken: null,
    });
  }
}
