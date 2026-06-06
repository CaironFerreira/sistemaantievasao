import { paginationSchema } from "@/lib/validators";

export function parsePagination(input: Record<string, string | undefined>) {
  return paginationSchema.parse({
    page: input.page,
    pageSize: input.pageSize,
  });
}

export function createPageResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
