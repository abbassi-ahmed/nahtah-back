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
import { NewsletterService } from './newsletter.service';
import { Newsletter } from './entities/newsletter.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { PaginatedResult } from 'src/types/paginatedResult';
import { CreateNewsletterDto } from './dto/createNewsLetter';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.create(createNewsletterDto);
  }

  @Get('all')
  async findAllPaginated(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Newsletter>> {
    return this.newsletterService.findAllPaginatedNews(pagination);
  }

  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @Get('admin/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.newsletterService.getByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsletterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsletterDto: Newsletter) {
    return this.newsletterService.update(+id, updateNewsletterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(+id);
  }
  @Delete()
  removeAll() {
    return this.newsletterService.removeAll();
  }
}
