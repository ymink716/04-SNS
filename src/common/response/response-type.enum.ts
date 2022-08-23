export const ResponseType = {
  // Auth
  registerUser: { code: 201, message: '회원가입 요청이 성공했습니다!' },
  loginUser: { code: 200, message: '로그인 요청에 성공했습니다!' },
  logoutUser: { code: 200, message: '로그아웃 요청에 성공했습니다!' },
  verifyUser: { code: 200, message: '유저 인증에 성공했습니다!' },
  refreshTokenWithUser: { code: 200, message: '유저 인증에 성공했습니다!' },

  // User
  getUser: { code: 200, message: '유저 정보 조회에 성공했습니다!' },
  follow: { code: 201, message: '해당 유저를 팔로우하였습니다!' },
  unfollow: { code: 200, message: '해당 유저를 언팔로우하였습니다!' },
  getFollows: { code: 200, message: '팔로우 목록 조회에 성공했습니다!' },

  // Post
  createPost: { code: 201, message: '게시물 생성에 성공했습니다!' },
  updatePost: { code: 200, message: '게시물 수정에 성공했습니다!' },
  deletePost: { code: 200, message: '게시물 삭제에 성공했습니다!' },
  restorePost: { code: 200, message: '게시물 복구에 성공했습니다.!' },
  getPost: { code: 200, message: '게시물 상새내용을 가져옵니다.' },
  getList: { code: 200, message: '게시물 리스트를 가져옵니다.' },

  // like
  createLike: { code: 201, message: '해당 게시물에 좋아요를 추가했습니다!' },
  deleteLike: { code: 201, message: '좋아요 취소에 성공했습니다!' },

  // Comment
  createComment: { code: 201, message: '댓글 생성에 성공했습니다!' },
  updateComment: { code: 200, message: '댓글 수정에 성공했습니다!' },
  deleteComment: { code: 200, message: '댓글 삭제에 성공했습니다!' },

};
  