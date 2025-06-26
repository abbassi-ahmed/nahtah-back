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
import { CreateNotificationDto } from './dto/createNotificationDto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
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
  @Get('count/:id')
  getNumberOfNotifications(@Param('id') id: string): Promise<number> {
    return this.notificationService.findNumberOfNotifications({ id });
  }
  @Get('user/:id')
  getByUserId(@Param('id') userId: string): Promise<Notification[]> {
    return this.notificationService.getByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Notification | null> {
    return this.notificationService.findOne(+id);
  }

  @Post('mark-as-viewed')
  async markAsViewed(
    @Body() body: { userId: string; notificationIds: string[] },
  ) {
    const { userId, notificationIds } = body;
    return this.notificationService.markAsViewed(userId, notificationIds);
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
  @Delete()
  removeAll() {
    return this.notificationService.deleteAll();
  }
}
