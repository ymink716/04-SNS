export const ErrorType = {
  // Auth
  unAuthorized: { code: 401, message: '로그인 후 이용해주세요' },
  confirmPasswordDoesNotMatch: { code: 400, message: '비밀번호와 비밀번호 확인이 일치하지 않습니다!' },

  // User
  invalideUser: { code: 400, message: '유효한 사용자가 아닙니다!' },
  userExists: { code: 400, message: '이미 존재하는 유저입니다!' },
  userNotFound: { code: 404, message: '존재하지 않는 유저입니다!' },
  nicknameExist: { code: 409, message: '해당 닉네임은 이미 사용중입니다!' },
  emailExist: { code: 409, message: '해당 이메일은 이미 사용중입니다!' },

  // Board
  boardNotFound: { code: 404, message: '해당 게시물이 존재하지 않습니다' },
  boardBadRequest: { code: 400, message: '해당 게시물 정보와 일치하지 않습니다.' },
  boardForbidden: { code: 400, message: '해당 게시물에 접근할 수 없습니다.' }, 

  // Server
  serverError: { code: 500, message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
  databaseServerError: { code: 500, message: '데이터베이스 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요' },
};