import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { UploadInput } from './dto/upload.input';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Query(() => String)
  test(): string {
    return 'Hello World!';
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Args('input', { type: () => UploadInput })
    uploadInput: UploadInput,
  ): Promise<string> {
    return this.uploadService.uploadFile(uploadInput);
  }
}
