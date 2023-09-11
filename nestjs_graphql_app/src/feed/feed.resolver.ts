import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FeedService } from './feed.service';
import { Feed } from './entities/feed.entity';
import { CreateFeedInput } from './dto/create-feed.input';
import { UpdateFeedInput } from './dto/update-feed.input';

@Resolver(() => Feed)
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}

  @Mutation(() => Feed)
  createFeed(@Args('createFeedInput') createFeedInput: CreateFeedInput) {
    return this.feedService.create(createFeedInput);
  }

  @Query(() => [Feed], { name: 'feed' })
  findAll() {
    return this.feedService.findAll();
  }

  @Query(() => Feed, { name: 'feed' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.feedService.findOne(id);
  }

  @Mutation(() => Feed)
  updateFeed(@Args('updateFeedInput') updateFeedInput: UpdateFeedInput) {
    return this.feedService.update(updateFeedInput.id, updateFeedInput);
  }

  @Mutation(() => Feed)
  removeFeed(@Args('id', { type: () => Int }) id: number) {
    return this.feedService.remove(id);
  }
}
