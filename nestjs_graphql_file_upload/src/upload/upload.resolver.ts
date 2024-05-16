import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Query(() => String)
  test(): string {
    return 'Hello World!';
  }

  @Mutation(() => Boolean)
  async uploadFile(@Args('string') string: string): Promise<string> {
    return this.uploadService.uploadFile(string);
  }
}
