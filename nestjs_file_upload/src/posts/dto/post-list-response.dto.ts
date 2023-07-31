import { OmitType } from '@nestjs/swagger';
import { Post } from '../../entities/post.entity';
import { omit } from '../../utils/dto.utils';

export class PostListResponseDto extends OmitType(Post, ['user']) {
  email: string;
  username: string;

  constructor(partial?: Partial<Post>) {
    super();
    return omit(partial, ['user']);
  }
}
