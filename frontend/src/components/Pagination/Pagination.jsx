import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 pt-3">
      <div className="small text-muted">
        Showing <span className="text-bright fw-semibold">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
        <span className="text-bright fw-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
        <span className="text-bright fw-semibold">{totalItems}</span> entries
      </div>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link bg-dark text-cyan border-secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft size={16} />
          </button>
        </li>
        {[...Array(totalPages)].map((_, i) => (
          <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
            <button
              className={`page-link border-secondary ${
                currentPage === i + 1 ? 'soc-btn-primary border-0' : 'bg-dark text-muted'
              }`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link bg-dark text-cyan border-secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight size={16} />
          </button>
        </li>
      </ul>
    </div>
  );
};
