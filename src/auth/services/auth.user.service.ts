import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import * as crypto from 'crypto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthUserService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  generatePassword(length = 12) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  createToken(payload: any, expiration?: string) {
    const options: any = {
      secret: process.env.JWT_SECRET,
    };

    if (expiration) {
      options.expiresIn = expiration;
    }

    return this.jwtService.sign(payload, options);
  }
  async login(body: LoginDto) {
    const user = await this.userService.findOneByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.createToken({
      email: user.email,
      id: user.id,
    });

    return {
      user: user,
      access_token: accessToken,
    };
  }
  async register(user: any) {
    const [existingUser, phoneExist] = await Promise.all([
      this.userService.findOneByEmail(user.email),
      this.userService.findOneByPhone(user.phone),
    ]);

    if (phoneExist) {
      throw new BadRequestException('رقم الهاتف موجود بالفعل');
    }

    if (existingUser) {
      throw new BadRequestException('المستخدم موجود بالفعل');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      password: hashedPassword,
    };
    const createdUser = await this.userService.create(newUser);
    const token = this.createToken({
      email: createdUser.email,
      id: createdUser.id,
    });
    return {
      user: createdUser,
      access_token: token,
    };
  }

  async verifyAcceptance(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!payload) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userService.findOneByEmail(payload.email);

    if (user?.username && user?.password) {
      return {
        status: 200,
        user: user,
        message: 'User already accepted invitation',
      };
    } else {
      throw new BadRequestException('User did not accept invitation');
    }
  }

  async resetPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.createToken(
      {
        email: email,
      },
      '1h',
    );

    const link = `${process.env.APP_URL}/reset_password/${token}`;

    try {
      return { status: 200, message: 'Invitation sent successfully' };
    } catch (e) {
      console.error(e);
      throw new Error('Error sending email');
    }
  }

  async verifyResetPwdToken(email: string, token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
    console.log('payload', payload);

    if (payload.email !== email) {
      throw new BadRequestException('Invalid token');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && currentTime > payload.exp) {
      throw new BadRequestException('Token has expired');
    }
    const user = await this.userService.findOneByEmail(email);

    return {
      user: user,
      status: 200,
      message: 'Token is valid',
    };
  }
}
