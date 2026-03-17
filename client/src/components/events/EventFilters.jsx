import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import SearchBar from '../ui/SearchBar.jsx';

const CATEGORIES = [
  'TECHNICAL','CULTURAL','SPORTS','WORKSHOP','SEMINAR',
  'GUEST_LECTURE','CLUB','PLACEMENT','AWARD_CEREMONY','COMPETITION','OTHER',
];
const STATUSES = ['DRAFT','PUBLISHED','ONGOING','COMPLETED','CANCELLED'];

const catLabel = (c) => c.replace('_', ' ');

const EventFilters = ({ filters, onChange, showStatus = true }) => {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = filters.category || filters.status || filters.dateFrom || filters.dateTo;

  const clearAll = () => onChange({ search: filters.search, category: '', status: '', dateFrom: '', dateTo: '' });

  return (
    <div className="mb-6 space-y-3">
      {/* Search + expand row */}
      <div className="flex gap-3 items-center">
        <SearchBar
          value={filters.search}
          onChange={(v) => update('search', v)}
          placeholder="Search events…"
          className="flex-1"
        />
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold uppercase tracking-[1px] transition-all duration-200 ${
            expanded || hasActiveFilters
              ? 'border-lime text-lime bg-lime/10'
              : 'border-border text-muted hover:border-lime hover:text-lime bg-ink'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          )}
        </button>
        {hasActiveFilters && (
          <button onClick={clearAll} className="p-2 rounded-lg border border-border text-muted hover:text-pink hover:border-pink transition-colors" title="Clear filters">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-surface border border-raised rounded-xl p-4 space-y-4 animate-fade-in">
          {/* Category chips */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => update('category', filters.category === c ? '' : c)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.5px] border transition-all duration-150 ${
                    filters.category === c
                      ? 'bg-lime text-ink border-lime'
                      : 'bg-raised border-border text-muted hover:border-lime hover:text-lime'
                  }`}
                >
                  {catLabel(c)}
                </button>
              ))}
            </div>
          </div>

          {/* Status chips */}
          {showStatus && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => update('status', filters.status === s ? '' : s)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.5px] border transition-all duration-150 ${
                      filters.status === s
                        ? 'bg-lime text-ink border-lime'
                        : 'bg-raised border-border text-muted hover:border-lime hover:text-lime'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted mb-1.5">From</p>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => update('dateFrom', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-ink border border-border text-white text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted mb-1.5">To</p>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => update('dateTo', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-ink border border-border text-white text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
