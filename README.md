# SNS 서비스

<br>

## 목차

---

* [프로젝트 개요](#프로젝트-개요)
* [기술 스택](#기술-스택) <br>
* [ERD](#erd) <br>
* [요구사항 분석 및 구현 상세](#요구사항-분석-및-구현-상세) <br>
* [API Documents](#api-documents) <br>
* [Test](#test) <br>
* [어려웠던 점 및 해결 방법](#어려웠던-점-및-해결-방법)
* [프로젝트 실행](#프로젝트-실행) <br>

<br>

## 프로젝트 개요

---

* 사용자는 본 서비스에 접속하여 게시물을 업로드 하거나 다른 사람의 게시물을 확인하고 댓글을 남기거나 좋아요를 누를 수 있습니다. 사용자는 서로 팔로우하여 친구 관계를 형성할 수 있습니다.

<br>

## 기술 스택

---

<div align=center> 
  <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=NestJS&logoColor=white">
  <img src="https://img.shields.io/badge/TypeORM-F96F29?style=for-the-badge&logo=기술스택아이콘&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">
  <img src="https://img.shields.io/badge/aws-232F3E?style=for-the-badge&logo=Amazon AWS&logoColor=white">
  <img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=NGINX&logoColor=white">
  <img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white">
</div>

<br>

## ERD

---
<div align=center>
  <img width="95%" src="https://user-images.githubusercontent.com/40125372/185046257-0808ab2e-37b9-4aff-8056-b0e00ba8b189.png"/>
</div>

* Post : 제목, 내용, 조회수 등 게시물 관련 정보를 가집니다. soft delete를 위해 deletedAt 칼럼을 추가하였습니다.
* Like : 좋아요 테이블입니다. 향후 확장성을 고려해 게시물-사용자 간 조인 테이블이 아닌 별도의 테이블로 설계하였습니다.
* Comment : 사용자가 게시물에 남긴 댓글에 관한 내용을 저장합니다.
* Post_View_Log : 게시물 조회 기록 테이블입니다. 클라이언트 ip, 사용자 id, 접속시간을 저장합니다.
* Hashtag : 해시태그 테이블입니다.
* Post_Hashtag : 게시물과 해시태그 간 관계를 연결한 테이블입니다.
* User : 사용자 테이블입니다.
* Follow : 사용자의 팔로워/팔로잉 관계를 관리하는 테이블입니다.

<br>

## 요구사항 분석 및 구현 상세

---

### Auth

* 회원가입 : POST /api/auth/register
  * email, password, nickname을 받아 회원가입을 처리합니다. 비밀번호는 해싱하여 저장합니다. 이메일과, 닉네임은 unique한 값으로 중복 시 error response를 반환합니다.
* 로그인 : POST /api/auth/login
  * email, password를 받아 로그인을 처리합니다. passport 모듈의 local strategy를 사용하여 유효한 사용자인지 확인한 후 access token과 refresh token을 발급합니다. refresh token을 DB에 저장하고, 발급 받은 토큰을 쿠키에 넣어 보내줍니다.
* 로그아웃 : POST /api/auth/logout
  * DB에 저장되어 있는 refresh token 값을 null로 바꾸고 쿠키에 담긴 토큰 정보를 제거합니다.
* access token 재요청 : GET /api/auth/accessToken
  * 리프레시 토큰을 확인하여 access token을 재발급 받아 쿠키에 넣어 보내줍니다.

### User

* 사용자 조회 : GET /api/users
  * 현재 접속한 사용자의 정보를 가져옵니다.
* 팔로우 : POST /api/users/follow/:followId
  * 사용자가 다른 유저를 팔로잉합니다. 두 사용자 간 follow 관계를 추가하여 구현합니다.
* 언팔로우 : DELETE /api/users/follow/followId
  * 사용자가 팔로우 관계를 해제합니다. 두 사용자 간 follow 관계를 삭제합니다.

### Post

* 게시물 생성 : POST /api/posts
  * 게시물 정보를 입력받아 게시물을 생성합니다. 게시물에 관련된 해시태그 리스트를 만들고 게시물과 해시태그 관계를 연결합니다. 이를 트랜잭션으로 진행한 후 생성된 게시물을 리턴합니다.
* 게시물 수정 : PUT /api/posts/:postId
  * 해당 게시물의 작성자가 접속한 사용자와 일치하는지 확인한 후 게시물을 수정하고 반환합니다.
* 게시물 삭제 : DELETE /api/posts/:postId
  * 해당 게시물의 작성자가 접속한 사용자와 일치하는지 확인한 후 게시물을 삭제(soft delete)합니다.
* 게시물 복구 : PUT /api/posts/restore/:postId
  * 삭제된 해당 게시물의 deletedAt 칼럼을 null로 바꿉니다.
* 게시물 상세 조회 : GET /api/posts/:postId
  * 로그인/비로그인 모두 볼 수 있도록 합니다.
  * 접속한 사용자 객체와 클라이언트 ip를 가지고 방문 기록이 있는지 확인합니다.
  * 게시물 상세 정보를 가져옵니다. 이때 방문 기록이 없다면 조회수를 1 늘려 DB에 저장하고 반환합니다.
  * 방문 기록을 저장하고 게시물 상세 정보를 리턴합니다.
* 게시물 리스트 조회 : GET /api/posts?sort&order&search&filter&take&page
  * 로그인/비로그인 모두 볼 수 있도록 합니다.
  * 생성일, 조회수, 좋아요 수를 가지고 정렬 기준(sort)을 정할 수 있습니다.
  * 정렬순서(order)로 내림차순, 오름차순을 결정할 수 있습니다.
  * 검색어(search)를 포함하는 게시물을 찾습니다.
  * 해시태그 필터(filter)로 해시태그를 포함하는 게시물을 가져옵니다.
  * 검색할 갯수(take), 불러올 페이지(page)로 pagenation을 할 수 있습니다.
  * 각 쿼리 파라미터는 optional하게 동작합니다.

### Comment

* 댓글 생성 : POST /api/comments
* 댓글 수정 : PUT /api/comments/:commentId
  * 댓글 작성자인지 확인 후 댓글을 수정합니다.
* 댓글 삭제 : DELETE /api/comments/:commentId
  * 댓글 작성자인지 확인 후 댓글을 삭제합니다.

### Like

* 좋아요 : POST /api/likes/:postId
  * 자신의 게시물이 아닌지 확인 후 게시물과 사용자 사이의 좋아요 관계를 생성합니다.
* 좋아요 취소 : DELETE /api/likes/:postId
  * 게시물과 사용자 사이의 좋아요 관계를 삭제합니다.

<br>

## API Documents

---

* Swagger API Docs : [http://3.39.33.63/api/docs](http://3.39.33.63/api/docs)

<br>

## Test

---

Service 계층에서 단위 테스트 작성

```
$ npm run test
```

<br>

## 어려웠던 점 및 해결 방법

---

* PostService에서 게시물 생성/수정 시 해시태그도 변경하는 로직에서 트랜잭션 사용
  * 트랜잭션을 적용해야하는 다른 Service에 TypeORM EntityManager를 넘겨주어 트랜잭션 내에서 다른 서비스 메서드를 호출할 수 있도록 변경
* PostController에서 게시물 조회 시 비로그인/로그인 모두 접근할 수 있지만 사용자 객체가 필요한 경우에 대한 처리
  * 인증 없이 해당 경로를 허용하는 custom decorator를 추가 (allowAny)
  * jwt auth guard에서 해당 데코레이터를 만나면 사용자 객체를 null로 리턴

<br>

## 프로젝트 실행

---

프로젝트를 clone 합니다.

```
$ git clone https://github.com/ymink716/04-SNS.git
```

프로젝트 루트 경로에 /env/.env 파일을 다음과 같이 생성합니다.

```
# env 예시
DB_HOST=backend-server
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=2222
DB_DATABASE=sns
JWT_ACCESS_TOKEN_SECRET=AccessTokenSecretTest
JWT_ACCESS_TOKEN_EXPIRATION_TIME=5h
JWT_REFRESH_TOKEN_SECRET=RefreshTokenSecretTest
JWT_REFRESH_TOKEN_EXPIRATION_TIME=14d
```

이후 다음 명령어를 실행합니다.
```
$ docker-compose build
$ docker-compose up
```

API 문서를 확인합니다.
[http://localhost/api/docs](http://localhost/api/docs)
