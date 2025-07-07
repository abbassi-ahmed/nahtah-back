import { PositionEnum } from 'src/types/positionEnum';

export class CreateUserDto {
  email: string;
  password: string;
  username: string;
  phone: string;
  position?: PositionEnum;
}
