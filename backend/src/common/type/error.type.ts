export const ErrorType = {
  // Auth
  auth: {
    unauthorized: { code: 401, msg: '로그인 후 이용해주세요' },
  },

  // User
  user: {
    invalidUser: { code: 400, msg: '유효한 사용자가 아닙니다!' },
    userExists: { code: 400, msg: '이미 존재하는 유저입니다!' },
    userNotFound: { code: 404, msg: '존재하지 않는 유저입니다!' },
    confirmPasswordDoesNotMatch: {
      code: 400,
      msg: '비밀번호와 비밀번호 확인이 일치하지 않습니다!',
    },
    nicknameExist: { code: 409, msg: '해당 닉네임은 이미 사용중입니다!' },
    emailExist: { code: 409, msg: '해당 이메일은 이미 사용중입니다!' },
  },

  // Feed
  feed: {
    restore: { code: 404, msg: '게시글 복구에 실패하였습니다' },
    delete: { code: 404, msg: '게시글 삭제에 실패하였습니다' },
    notFound: { code: 404, msg: '존재하지 않는 게시글입니다' },
    failLike: { code: 406, msg: '좋아요 처리에 실패하였습니다' },
  },
};
