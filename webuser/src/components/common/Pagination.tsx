import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemCount?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 3,
}: PaginationProps) => {
  // Ensure numeric inputs
  const currentPageNum = Number(currentPage);
  const totalPagesNum = Number(totalPages);
  const totalItemsNum = Number(totalItems || 0);
  const itemsPerPageNum = Number(itemsPerPage);

  // Calculate total pages based on total items and items per page
  const calculatedTotalPages = Math.ceil(totalItemsNum / itemsPerPageNum);

  // Use the calculated total pages instead of the provided totalPages
  const effectiveTotalPages = Math.max(calculatedTotalPages, totalPagesNum);
  
  // Return null if no pages or invalid input
  if (isNaN(currentPageNum) || isNaN(effectiveTotalPages) || effectiveTotalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    // Ensure currentPage and totalPages are valid numbers
    const currentPageNum = Number(currentPage);
    const totalPagesNum = Number(effectiveTotalPages);
  
    // Validate inputs
    if (isNaN(currentPageNum) || isNaN(totalPagesNum) || totalPagesNum <= 1) {
      return [];
    }
  
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;
  
    // Always include first and last page
    range.push(1);
    if (totalPagesNum > 1) {
      range.push(totalPagesNum);
    }
  
    // Add pages around current page
    for (
      let i = Math.max(2, currentPageNum - delta);
      i <= Math.min(totalPagesNum - 1, currentPageNum + delta);
      i++
    ) {
      if (!range.includes(i)) {
        range.push(i);
      }
    }
  
    // Sort the range
    range.sort((a, b) => a - b);
  
    // Add ellipsis where needed
    for (let i = 0; i < range.length; i++) {
      if (l) {
        if (range[i] - l > 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(range[i]);
      l = range[i];
    }
  
    return rangeWithDots;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && page >= 1 && page <= effectiveTotalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 w-full bg-white text-sm rounded">
      {/* Navigation */}
      <nav className="flex items-center space-x-1">
        {/* First page */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-mediumGray hover:text-primary hover:bg-secondary'
          }`}
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-mediumGray hover:text-primary hover:bg-secondary'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-2 rounded ${
                page === currentPage
                  ? 'bg-primary text-secondary hover:bg-primaryContrast'
                  : page === '...'
                  ? 'text-mediumGray cursor-default'
                  : 'text-mediumGray hover:text-primary hover:bg-secondary'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === effectiveTotalPages}
          className={`p-2 rounded ${
            currentPage === effectiveTotalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-mediumGray hover:text-primary hover:bg-secondary'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Last page */}
        <button
          onClick={() => handlePageClick(effectiveTotalPages)}
          disabled={currentPage === effectiveTotalPages}
          className={`p-2 rounded ${
            currentPage === effectiveTotalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-mediumGray hover:text-primary hover:bg-secondary'
          }`}
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
};