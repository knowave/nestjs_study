import { Args, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { GetHelloInput, GetHelloOutput } from './dto/get-hello.dto';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => GetHelloOutput)
  async getHello(
    @Args('input') getHelloInput: GetHelloInput,
  ): Promise<GetHelloOutput> {
    return this.appService.getHello(getHelloInput);
  }
}
