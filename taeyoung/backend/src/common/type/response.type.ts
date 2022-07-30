export const ResponseType = {
  user: {
    createUser: { code: 201, msg: '회원가입 요청이 성공했습니다!' },
    getUser: { code: 200, msg: '유저 정보 조회에 성공했습니다!' },
  },
  auth: {
    loginUser: { code: 201, msg: '유저 로그인 요청에 성공했습니다!' },
    restoreAccessToken: { code: 201, msg: '액세스 토큰 복구에 성공했습니다!' },
  },
  feed: {
    create: { code: 201, msg: '게시글이 성공적으로 생성되었습니다!' },
    update: { code: 200, msg: '게시글이 성공적으로 수정되었습니다!' },
    delete: { code: 200, msg: '게시글이 성공적으로 삭제되었습니다!' },
    restore: { code: 200, msg: '게시글이 성공적으로 복구되었습니다!' },
    like: { code: 201, msg: '게시글 좋아요가 성공적으로 반영되었습니다!' },
    cancelLike: {
      code: 201,
      msg: '게시글 좋아요 취소가 성공적으로 반영되었습니다!',
    },
    fetch: { code: 200, msg: '게시글 상세 조회 성공!' },
    fetches: { code: 200, msg: '게시글 목록 조회 성공!' },
  },
};
