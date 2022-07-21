export interface FetchFeedOptions {
  search?: string;
  order?: OrderOption;
  orderBy?: OrderByOption;
  filter?: string;
  page?: number;
  pageCount?: number;
}

export enum OrderByOption {
  DESC = 'DESC',
  ASC = 'ASC',
}

export enum OrderOption {
  CREATEDAT = 'createdAt',
  WATCHCOUNT = 'watchCount',
  LIKECOUNT = 'likeCount',
}
