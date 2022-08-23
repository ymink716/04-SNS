import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Follow {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '팔로워' })
  @ManyToOne(() => User, user => user.followers, {
    onDelete: 'CASCADE',
    nullable: false
  })
  follower: User;

  @ApiProperty({ description: '팔로잉' })
  @ManyToOne(() => User, user => user.followings, {
    onDelete: 'CASCADE',
    nullable: false
  })
  following: User;
}
