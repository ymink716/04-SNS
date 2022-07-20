import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryColumn({ type: 'char', unique: true })
  @ApiProperty({
    uniqueItems: true,
    description: '유저의 이메일 주소',
    example: 'leo@naver.com',
  })
  @IsEmail()
  email: string;

  @Column()
  @ApiProperty({ description: '유저의 비밀번호' })
  password: string;
}
