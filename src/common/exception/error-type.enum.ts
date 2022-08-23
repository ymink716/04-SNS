export const ErrorType = {
  // Auth
  unauthorized: { code: 401, message: '인증되지 않은 사용자입니다.' },
  passwordDoesNotMatch: { code: 400, message: '비밀번호가 일치하지 않습니다!' },

  // User
  invalideUser: { code: 400, message: '유효한 사용자가 아닙니다!' },
  userExists: { code: 400, message: '이미 존재하는 유저입니다!' },
  userNotFound: { code: 404, message: '존재하지 않는 유저입니다!' },
  nicknameExist: { code: 409, message: '해당 닉네임은 이미 사용중입니다!' },
  emailExist: { code: 409, message: '해당 이메일은 이미 사용중입니다!' },
  canNotFollowSameUser: { code: 400, message: '같은 유저를 팔로우할 수 없습니다.' },
  followNotFound: { code: 404, message: '해당 팔로우 관계를 찾을 수 없습니다.' },
  alreadyFollowed: { code: 400, message: '이미 팔로우 중인 유저입니다.' },
  
  // Post
  postNotFound: { code: 404, message: '해당 게시물이 존재하지 않습니다' },
  postBadRequest: { code: 400, message: '해당 게시물 정보와 일치하지 않습니다.' },
  postForbidden: { code: 403, message: '해당 게시물에 접근할 권한이 없습니다.' },
  postNotDeleted: { code: 400, message: '삭제되지 않은 게시물입니다.' },
  
  // Like
  likeForbidden: { code: 403, message: '자신의 게시물에 좋아요를 할 수 없습니다.' },

  // Comment
  commentNotFound: { code: 404, message: '해당 댓글을 찾을 수 없습니다.' },
  commentForbidden: { code: 403, message: '해당 댓글에 접근할 권한이 없습니다.' },

  // Server
  serverError: { code: 500, message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
  databaseServerError: { code: 500, message: '데이터베이스 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요' },
};