import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(30, { message: '제목은 30자 이하로 입력해주세요.' })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: '내용은 200자 이하로 입력해주세요.' })
  content?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
