import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const delta = 2;
  const left  = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);

  if (left > 1) { pages.push(1); if (left > 2) pages.push('…'); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

  const btn = (label, page, active = false, disabled = false) => (
    <button
      key={label}
      onClick={() => !disabled && typeof page === 'number' && onPageChange(page)}
      disabled={disabled || label === '…'}
      className={`
        min-w-[36px] h-9 px-2 rounded-lg text-sm font-bold uppercase tracking-[0.5px]
        transition-all duration-150 border
        ${active
          ? 'bg-lime text-ink border-lime shadow-lime-sm'
          : label === '…'
          ? 'bg-transparent border-transparent text-muted cursor-default'
          : 'bg-card border-border text-secondary hover:border-lime hover:text-lime'}
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {btn(<ChevronLeft className="w-4 h-4" />, currentPage - 1, false, currentPage === 1)}
      {pages.map((p, i) =>
        btn(p === '…' ? '…' : p, p, p === currentPage, false)
      )}
      {btn(<ChevronRight className="w-4 h-4" />, currentPage + 1, false, currentPage === totalPages)}
    </div>
  );
};

export default Pagination;
