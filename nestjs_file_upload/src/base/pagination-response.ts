import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class MyPagination<PaginationObject> {
  @ApiProperty({ isArray: true })
  items: PaginationObject[];

  @ApiProperty()
  readonly meta: IPaginationMeta;

  constructor(items: PaginationObject[], meta: IPaginationMeta) {
    this.items = items;
    this.meta = meta;
  }
}
