export const ResponseType = {
  // User
  createUser: { code: 201, msg: '회원가입 요청이 성공했습니다!' },
  getUser: { code: 200, msg: '유저 정보 조회에 성공했습니다!' },
  loginUser: { code: 200, msg: '유저 로그인 요청에 성공했습니다!' },
  logoutUser: { code: 200, msg: '유저 로그아웃 요청에 성공했습니다!' },
  verifyUser: { code: 200, msg: '유저 인증 성공에 성공했습니다!' },
  refreshTokenWithUser: { code: 200, msg: '유저 인증 성공에 성공했습니다!' },

  // Feed
  createFeed: { code: 201, msg: '게시글 생성 성공!' },
  updateFeed: { code: 200, msg: '게시글 수정 성공!' },
  deleteFeed: { code: 200, msg: '게시글 삭제 성공!' },
  restoreFeed: { code: 200, msg: '게시글 복구 성공!' },
  likeFeed: { code: 201, msg: '게시글 좋아요 성공!' },
  fetchFeed: { code: 200, msg: '게시글 상세 조회 성공!' },
  fetchFeeds: { code: 200, msg: '게시글 목록 조회 성공!' },
};
