import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { PaginationDto } from '../utils/dtos/pagination.dto';
import { CreateEventDto } from './dto/createEventDto';
import { PaginatedResult } from 'src/types/paginatedResult';
import { UpdateFeedbackDto } from './dto/updateEventDto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  @Get('all')
  findAllPaginated(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Event>> {
    return this.eventService.findAllPaginatedEvents(pagination);
  }

  @Get('status/:status')
  getByStatus(@Param('status') status: string): Promise<Event[]> {
    let statusValue: boolean | null;

    if (status === 'true') statusValue = true;
    else if (status === 'false') statusValue = false;
    else statusValue = null;

    return this.eventService.getByStatus(statusValue);
  }

  @Get('client/:clientId')
  getByClientId(@Param('clientId') clientId: string): Promise<Event[]> {
    return this.eventService.getByClientId(clientId);
  }
  @Get('count')
  countDocuments(): Promise<number> {
    return this.eventService.countDocuments();
  }

  @Get('date/:date')
  getEventByDate(@Param('date') date: string): Promise<Event[]> {
    return this.eventService.getEventByDate(date);
  }
  @Get('reviews')
  getEventsReviews(@Query() pagination: PaginationDto) {
    return this.eventService.getEventsReviews(pagination);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: CreateEventDto,
  ): Promise<Event | null> {
    return this.eventService.update(id, updateEventDto);
  }

  @Patch(':id/status/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ): Promise<Event | null> {
    let statusValue: true | false | null;

    if (status === 'true') statusValue = true;
    else if (status === 'false') statusValue = false;
    else statusValue = null;

    return this.eventService.updateStatus(id, statusValue);
  }
  @Put(':id/feedback')
  updateFeedback(
    @Param('id') id: string,
    @Body() { feedback, rate }: UpdateFeedbackDto,
  ): Promise<Event | null> {
    return this.eventService.updateFeedback(id, feedback, rate);
  }

  @Put(':id/status')
  updateEventStatus(
    @Param('id') id: string,
    @Body() { status }: { status: 'ACCEPTED' | 'DECLINED' | 'PENDING' },
  ): Promise<Event | null> {
    return this.eventService.updateEventStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Event | null> {
    return this.eventService.remove(+id);
  }

  @Delete()
  deleteAll(): Promise<void> {
    return this.eventService.deleteAll();
  }
}
