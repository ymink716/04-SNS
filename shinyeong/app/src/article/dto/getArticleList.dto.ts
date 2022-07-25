export interface getArticleListOption {
  limit?: number;
  offset?: number;
  search?: string;
  filter?: string;
  order?: 'ASC' | 'DESC';
  orderBy?: string;
}

export enum orderOption {
  DESC = 'DESC',
  ASC = 'ASC',
}

export enum orderByOption {
  CREATEDAT = 'createdAt',
  TOTALVIEW = 'totalView',
  TOTALLIKE = 'totalLike',
}
