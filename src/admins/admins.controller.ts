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
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterQuery } from 'mongoose';
import { Admin } from './entities/admin.entity';
import { AdminsService } from './admins.service';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async create(@Body() user: Admin): Promise<Admin> {
    return this.adminsService.create(user);
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<{ data: Admin[]; total: number }> {
    return this.adminsService.findAllPaginatedAdmins(pagination);
  }

  @Get('search')
  async search(@Query() filter: FilterQuery<Admin>): Promise<Admin[]> {
    return this.adminsService.findMany(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Admin | null> {
    return this.adminsService.findOneById(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Admin | null> {
    return this.adminsService.findOneByEmail(email);
  }

  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<Admin | null> {
    return this.adminsService.findOneByUsername(username);
  }

  @Get('phone/:phone')
  async findByPhone(@Param('phone') phone: string): Promise<Admin | null> {
    return this.adminsService.findOneByPhone(phone);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() user: Partial<Admin>,
  ): Promise<Admin | null> {
    return this.adminsService.updateById(id, user);
  }

  @Put('reset-code')
  async updateResetCode(
    @Body() body: { email: string; code: string; expiration: string },
  ): Promise<Admin | null> {
    return this.adminsService.updateResetCode(
      body.email,
      body.code,
      body.expiration,
    );
  }

  @Put('password')
  async updatePassword(
    @Body() body: { email: string; password: string },
  ): Promise<Admin | null> {
    return this.adminsService.updatePassword(body.email, body.password);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Admin | null> {
    return this.adminsService.deleteById(id);
  }
}
