import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { ResponseType } from 'src/common/type/response-type.enum'; 
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserResponse } from './dto/user-response';
import { FollowService } from './follow.service';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
  ) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '팔로우를 추가합니다.', summary: '팔로우' })
  @ApiCreatedResponse({ description: ResponseType.follow.message })
  @Post('/follow/:followId')
  async follow(@Param('followId', ParseIntPipe) followId: number, @GetUser() user: User) {
    const following = await this.userService.getUserById(followId);

    await this.followService.follow(following, user);

    return UserResponse.response(
      ResponseType.follow.code,
      ResponseType.follow.message,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '팔로우를 해제합니다.', summary: '언팔로우' })
  @ApiOkResponse({ description: ResponseType.follow.message })
  @Delete('/follow/:followId')
  async unfollow(@Param('followId', ParseIntPipe) followId: number, @GetUser() user: User) {
    const following = await this.userService.getUserById(followId);

    await this.followService.unfollow(following, user);

    return UserResponse.response(
      ResponseType.unfollow.code,
      ResponseType.unfollow.message,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '유저의 팔로워 목록을 가져옵니다.', summary: '팔로워 목록' })
  @ApiOkResponse({ description: ResponseType.getFollowers.message })
  @Get('/followers')
  async getUserByFollowers(@GetUser() user: User) {
    const followers = await this.userService.getUsersByFollowers(user);

    return UserResponse.response(
      ResponseType.getFollowers.code,
      ResponseType.getFollowers.message,
      followers,
    );    
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '유저의 팔로잉 목록을 가져옵니다.', summary: '팔로잉 목록' })
  @ApiOkResponse({ description: ResponseType.getFollowings.message })
  @Get('/followings')
  async getUserByFollowings(@GetUser() user: User) {
    const followings = await this.userService.getUsersByFollowings(user);

    return UserResponse.response(
      ResponseType.getFollowings.code,
      ResponseType.getFollowings.message,
      followings,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '유저 정보를 가져옵니다.', summary: '유저 정보' })
  @ApiResponse({ description: ResponseType.getUser.message })
  @Get()
  async getUser(@GetUser() user: User) {
    return UserResponse.response(
      ResponseType.getUser.code,
      ResponseType.getUser.message,
      user.toJSON(),
    );
  }
}
