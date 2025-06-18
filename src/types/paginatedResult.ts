export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
