export interface GetPostsOptions {
  sort?: SortOption;
  order?: OrderOption;
  search?: string;
  filter?: string;
  page?: number;
  take?: number;
}

export enum SortOption {
  CREATEDAT = 'createdAt',
  VIEWS = 'views',
  likes = 'likes',
}

export enum OrderOption {
  DESC = 'DESC',
  ASC = 'ASC',
}