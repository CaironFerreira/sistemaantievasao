import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildQueryString } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
};

export function Pagination({
  page,
  pageCount,
  pathname,
  searchParams = {},
}: PaginationProps) {
  const previousDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Pagina {page} de {pageCount}
      </p>
      <div className="flex gap-2">
        <Button asChild disabled={previousDisabled} variant="outline">
          <Link
            aria-disabled={previousDisabled}
            href={
              previousDisabled
                ? pathname
                : `${pathname}?${buildQueryString({
                    ...searchParams,
                    page: page - 1,
                  })}`
            }
            tabIndex={previousDisabled ? -1 : 0}
          >
            Anterior
          </Link>
        </Button>
        <Button asChild disabled={nextDisabled} variant="outline">
          <Link
            aria-disabled={nextDisabled}
            href={
              nextDisabled
                ? pathname
                : `${pathname}?${buildQueryString({
                    ...searchParams,
                    page: page + 1,
                  })}`
            }
            tabIndex={nextDisabled ? -1 : 0}
          >
            Proxima
          </Link>
        </Button>
      </div>
    </div>
  );
}
