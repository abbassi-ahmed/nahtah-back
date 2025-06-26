import { Model, PopulateOptions } from 'mongoose';
import { PaginationDto } from '../dtos/pagination.dto';
import { PaginatedResult } from 'src/types/paginatedResult';

async function findAllPaginated<T>(
  model: Model<T>,
  pagination: PaginationDto,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  filter: Record<string, any> = {},
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = '_id',
    sortOrder = 'asc',
  } = pagination;

  const currentPage = Math.max(1, page);
  const perPage = Math.max(1, limit);
  const skip = (currentPage - 1) * perPage;

  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };

  let query = model.find(filter).sort(sort).skip(skip).limit(perPage);

  if (populate) {
    query = query.populate(populate);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    data,
    pagination: {
      total,
      totalPages,
      currentPage,
      perPage,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
export { findAllPaginated, PaginatedResult };
