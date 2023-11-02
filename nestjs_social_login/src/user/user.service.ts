import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { LocalRegisterDto } from './dto/local-register.dto';
import { USER_EXCEPTION } from 'src/common/error/error-code';
import * as bcrypt from 'bcrypt';
import { socialRegisterDto } from './dto/social-register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async localRegister(localRegisterDto: LocalRegisterDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existEmail = await this.userRepository.findOne({
        where: { email: localRegisterDto.email },
      });
      const existNickname = await this.userRepository.findOne({
        where: { nickname: localRegisterDto.nickname },
      });

      if (existEmail || existNickname)
        throw new BadRequestException(USER_EXCEPTION.EXIST_USER);

      const hashedPassword = await bcrypt.hash(
        localRegisterDto.password,
        this.configService.get('BCRYPT_SALT'),
      );
      const savedUser = await queryRunner.manager.save(User, {
        email: localRegisterDto.email,
        nickname: localRegisterDto.nickname,
        password: hashedPassword ? hashedPassword : null,
      });
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Local 회원가입 중 에러가 발생했습니다. ${err}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async socialRegister(
    socialRegisterDto: socialRegisterDto,
    user: any,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      switch (user.type) {
        case 'login':
          throw new BadRequestException(USER_EXCEPTION.EXIST_USER);
        case 'kakao':
          const savedKakaoAccount = await queryRunner.manager.save(User, {
            email: socialRegisterDto.email,
            kakaoAccount: user.id,
            nickname: socialRegisterDto.password,
          });
          await queryRunner.commitTransaction();
          return savedKakaoAccount;
        case 'google':
          const savedGoogleAccount = await queryRunner.manager.save(User, {
            email: socialRegisterDto.email,
            googleAccount: user.id,
            nickname: socialRegisterDto.password,
          });
          await queryRunner.commitTransaction();
          return savedGoogleAccount;
        case 'naver':
          const savedNaverAccount = await queryRunner.manager.save(User, {
            email: socialRegisterDto.email,
            naverAccount: user.id,
            nickname: socialRegisterDto.password,
          });
          await queryRunner.commitTransaction();
          return savedNaverAccount;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `소셜 회원의 회원가입 중 에러가 발생했습니다. ${err}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    return user;
  }
}
