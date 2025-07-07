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
import { User } from '../entities/user.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { PaginatedResult } from 'src/types/paginatedResult';
import { CreateUserDto } from '../dto/createUser.dto';
import { AdminsService } from '../services/admin.service';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.adminsService.create(user);
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<User>> {
    return this.adminsService.findAllPaginatedUsers(pagination);
  }

  @Get('search')
  async search(@Query() filter: FilterQuery<User>): Promise<User[]> {
    return this.adminsService.findMany(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.adminsService.findOneById(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.adminsService.findOneByEmail(email);
  }

  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    return this.adminsService.findOneByUsername(username);
  }

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string): Promise<User | null> {
    return this.adminsService.findOneByPhone(phone);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() user: Partial<User>,
  ): Promise<User | null> {
    return this.adminsService.updateById(id, user);
  }

  @Put('reset-code')
  async updateResetCode(
    @Body() body: { email: string; code: string; expiration: string },
  ): Promise<User | null> {
    return this.adminsService.updateResetCode(
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
    return await this.adminsService.archiveUser(id, body.password, body.reason);
  }

  @Put('password')
  async updatePassword(
    @Body() body: { email: string; password: string },
  ): Promise<User | null> {
    return this.adminsService.updatePassword(body.email, body.password);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User | null> {
    return this.adminsService.deleteById(id);
  }
}
