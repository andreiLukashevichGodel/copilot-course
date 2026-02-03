import { useSearchParams } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export function Pagination({ currentPage, totalPages, totalCount, pageSize }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const showPages = 5; // Show current page + 2 on each side

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // Adjust if we're near the beginning or end
    if (currentPage <= 3) {
      end = Math.min(showPages, totalPages);
    }
    if (currentPage > totalPages - 3) {
      start = Math.max(1, totalPages - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items count */}
      <div className="text-sm text-gray-400">
        Showing {startItem}-{endItem} of {totalCount} movies
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 text-white hover:bg-gray-600"
        >
          Previous
        </button>

        {/* Page numbers - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition bg-gray-700 text-white hover:bg-gray-600"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => goToPage(totalPages)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition bg-gray-700 text-white hover:bg-gray-600"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Page indicator for mobile */}
        <div className="sm:hidden text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 text-white hover:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
