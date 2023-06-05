import {
  IPaginationMeta,
  IPaginationOptionsRoutingLabels,
  PaginationTypeEnum,
  TypeORMCacheType,
} from 'nestjs-typeorm-paginate/dist/interfaces';

export interface MyPaginationQuery<CustomMetaType = IPaginationMeta> {
  search?: string;

  searchBy?: string[];

  filter?: string;
  sortBy?: [string, string][];

  /**
   * @default 10
   * the amount of items to be requested per page
   */
  limit: number | string;
  /**
   * @default 1
   * the page that is requested
   */
  page: number | string;
  /**
   * a basic route for generating links (i.e., WITHOUT query params)
   */
  route?: string;
  /**
   * For transforming the default meta data to a custom type
   */
  metaTransformer?: (meta: IPaginationMeta) => CustomMetaType;
  /**
   * routingLabels for append in links (limit or/and page)
   */
  routingLabels?: IPaginationOptionsRoutingLabels;
  /**
   * @default PaginationTypeEnum.LIMIT
   * Used for changing query method to take/skip (defaults to limit/offset if no argument supplied)
   */
  paginationType?: PaginationTypeEnum;
  /**
   * @default true
   * Turn off pagination count total queries. itemCount, totalItems, itemsPerPage and totalPages will be undefined
   */
  countQueries?: boolean;
  /**
   * @default false
   * @link https://orkhan.gitbook.io/typeorm/docs/caching
   *
   * Enables or disables query result caching.
   */
  cacheQueries?: TypeORMCacheType;
}
