import { Search, X } from 'lucide-react';
import { useState } from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search…', className = '' }) => {
  const handleClear = () => onChange('');

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2.5 rounded-lg
          bg-ink border border-border text-white text-sm
          placeholder:text-muted
          focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20
          transition-all duration-200
        "
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-lime transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
