import type { CSSProperties } from "react";
import { Button } from "react-bootstrap";

interface PaginationProps {
  handlePageChange: (newPage: number) => void;
  styles?: CSSProperties;
  totalPages: number;
  pageNumber: number;
}

const Pagination = ({
  handlePageChange,
  totalPages,
  pageNumber,
  styles,
}: PaginationProps) => {
  const nextPage = () => {
    if (pageNumber < totalPages) handlePageChange(pageNumber + 1);
  };

  const prevPage = () => {
    if (pageNumber > 1) handlePageChange(pageNumber - 1);
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={styles}
    >
      <Button onClick={prevPage} disabled={pageNumber === 1}>
        Prev
      </Button>
      <span>
        page {pageNumber} of {totalPages}
      </span>
      <Button onClick={nextPage} disabled={pageNumber === totalPages}>
        Next
      </Button>
    </div>
  );
};

export default Pagination;
