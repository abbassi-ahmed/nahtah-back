import { Model } from 'mongoose';
import { PaginationDto } from '../dtos/pagination.dto';

async function findAllPaginated<T>(
  model: Model<T>,
  pagination: PaginationDto,
): Promise<{ data: T[]; total: number }> {
  const {
    page = 1,
    limit = 10,
    sortBy = '_id',
    sortOrder = 'asc',
  } = pagination;

  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    model.find().sort(sort).skip(skip).limit(limit).exec(),
    model.countDocuments().exec(),
  ]);

  return { data, total };
}

export { findAllPaginated };
