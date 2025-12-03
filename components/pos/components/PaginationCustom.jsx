import React from "react";

const PaginationCustom = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const totalVisible = 5;
  let startPage = Math.max(page - Math.floor(totalVisible / 2), 1);
  let endPage = startPage + totalVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - totalVisible + 1, 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav>
      <div className="d-flex flex-column align-items-center">
        <ul className="pagination mb-0 justify-content-center">
          {/* Prev */}
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => page > 1 && onChange(page - 1)}
            >
              &laquo;
            </button>
          </li>

          {/* Nếu cần hiển thị dấu "..." bên trái */}
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => onChange(1)}>
                  1
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            </>
          )}

          {/* Page numbers */}
          {pages.map((p) => (
            <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
              <button
                className="page-link"
                onClick={() => p !== page && onChange(p)}
              >
                {p}
              </button>
            </li>
          ))}

          {/* Nếu cần hiển thị "..." bên phải */}
          {endPage < totalPages && (
            <>
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => onChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next */}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => page < totalPages && onChange(page + 1)}
            >
              &raquo;
            </button>
          </li>
        </ul>

        <small className="text-muted mt-1">
          Trang {page} / {totalPages}
        </small>
      </div>
    </nav>
  );
};

export default PaginationCustom;
