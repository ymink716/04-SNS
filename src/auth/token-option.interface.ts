export interface ITokenOption {
    domain: string;
    path: string;
    httpOnly: boolean;
    maxAge?: number;
  }
  
  export const defaultTokenOption: ITokenOption = {
    domain: 'localhost',
    path: '/',
    httpOnly: true,
  };
  