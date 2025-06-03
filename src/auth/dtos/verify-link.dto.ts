// import { User } from '@/api-interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyLinkDto {
  // @ApiProperty()
  // user: User;
  @ApiProperty()
  @IsString()
  token: string;
}
