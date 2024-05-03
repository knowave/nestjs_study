import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(30, { message: '제목은 30자 이하로 입력해주세요.' })
  title: string;

  @IsString()
  @MaxLength(200, { message: '내용은 200자 이하로 입력해주세요.' })
  content: string;

  @IsBoolean()
  published: boolean;
}
