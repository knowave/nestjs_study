import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{4,}$/, {
    message:
      '비밀번호는 적어도 4자, 1개의 숫자, 1개의 특수 문자를 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @Length(2, 10, { message: '이름은 2자 이상 10자 이하로 입력해야 합니다' })
  name: string;
}
