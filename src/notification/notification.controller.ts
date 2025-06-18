import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { PaginationDto } from '../utils/dtos/pagination.dto';
import { PaginatedResult } from 'src/types/paginatedResult';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: Notification): Promise<Notification> {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll(): Promise<Notification[]> {
    return this.notificationService.findAll();
  }

  @Get('all')
  findAllPaginated(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationService.findAllPaginatedNotifications(pagination);
  }

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationService.getByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: Notification,
  ): Promise<Notification | null> {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationService.remove(+id);
  }
}
