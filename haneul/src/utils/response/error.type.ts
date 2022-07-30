export const ErrorType = {
  /**user */
  userNotFound: '존재하지 않는 유저입니다!',
  emailAlreadyExists: '해당 이메일은 이미 사용중입니다!',
  invalidPassword: '비밀번호가 일치하지 않습니다!',
  unauthorizedUser: '호출자에게 필요한 권한이 없습니다!',

  /**post*/
  postNotFound: '존재하지 않는 게시물입니다!',
  postNotDeleted: '삭제되지 않은 게시물입니다!',
  userAlreadyLiked: '이미 해당 게시물에 좋아요를 보낸 유저입니다!',
  postAuthorIsSame: '본인의 게시물에 좋아요를 보낼 수 없습니다!',

  /**server*/
  serverError: '서버 에러입니다!',
};
