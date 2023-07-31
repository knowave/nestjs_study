import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(24)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]*$/, {
    message:
      '비밀번호를 10자 이상 24자 이하로 영문, 숫자, 특수문자의 조합으로 다시 시도해주세요.',
  })
  password: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(24)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]*$/, {
    message:
      '비밀번호를 10자 이상 24자 이하로 영문, 숫자, 특수문자의 조합으로 다시 시도해주세요.',
  })
  confirmPassword: string;
}
