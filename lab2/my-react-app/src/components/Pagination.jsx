import React from 'react';

export default function Pagination({ page, totalPages, onPrev, onNext, disabled }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button 
        className="btn btn-pagination" 
        onClick={onPrev} 
        disabled={page === 1 || disabled}
      >
        &larr; Previous
      </button>
      <span className="page-indicator">
        Page {page} of {totalPages}
      </span>
      <button 
        className="btn btn-pagination" 
        onClick={onNext} 
        disabled={page >= totalPages || disabled}
      >
        Next &rarr;
      </button>
    </div>
  );
}