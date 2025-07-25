import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = '_id';

  @IsOptional()
  @IsString()
  id?: string;
  @IsOptional()
  @IsString()
  status?: ['ACCEPTED', 'DECLINED', 'PENDING'];

  @IsOptional()
  banned?: boolean;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
