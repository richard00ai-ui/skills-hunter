import Link from 'next/link';

interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, total, pageSize = 20, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className="rounded px-3 py-1 text-sm text-gray-400 hover:text-white">
          ← 上一页
        </Link>
      )}
      <span className="text-sm text-gray-500">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className="rounded px-3 py-1 text-sm text-gray-400 hover:text-white">
          下一页 →
        </Link>
      )}
    </div>
  );
}
