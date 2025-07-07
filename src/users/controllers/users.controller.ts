import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { PaginatedResult } from 'src/types/paginatedResult';
import { CreateUserDto } from '../dto/createUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.usersService.create(user);
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<User>> {
    return this.usersService.findAllPaginatedUsers(pagination);
  }

  @Get('search')
  async search(@Query() filter: FilterQuery<User>): Promise<User[]> {
    return this.usersService.findMany(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOneById(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findOneByEmail(email);
  }

  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    return this.usersService.findOneByUsername(username);
  }

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string): Promise<User | null> {
    return this.usersService.findOneByPhone(phone);
  }

  @Put('ban/:id')
  async banUser(
    @Param('id') id: string,
    @Body() body: { ban: boolean },
  ): Promise<User | null> {
    return this.usersService.banOrUnbanUser(id, body.ban);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() user: Partial<User>,
  ): Promise<User | null> {
    return this.usersService.updateById(id, user);
  }

  @Put('reset-code')
  async updateResetCode(
    @Body() body: { email: string; code: string; expiration: string },
  ): Promise<User | null> {
    return this.usersService.updateResetCode(
      body.email,
      body.code,
      body.expiration,
    );
  }
  @Put(':id/archive')
  async archiveUser(
    @Param('id') id: string,
    @Body() body: { password: string; reason?: string },
  ): Promise<User | null> {
    return await this.usersService.archiveUser(id, body.password, body.reason);
  }

  @Put('password')
  async updatePassword(
    @Body() body: { email: string; password: string },
  ): Promise<User | null> {
    return this.usersService.updatePassword(body.email, body.password);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User | null> {
    return this.usersService.deleteById(id);
  }
}
