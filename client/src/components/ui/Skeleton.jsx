import { cn } from '../../utils/helpers.js';

const Skeleton = ({ className, variant = 'text' }) => {
  const base = 'skeleton-shimmer rounded';
  const variants = {
    text:   'h-4 w-full rounded',
    card:   'w-full h-48 rounded-2xl',
    avatar: 'rounded-full w-10 h-10',
    stat:   'w-32 h-20 rounded-2xl',
  };
  return (
    <div
      className={cn(base, variants[variant] ?? variants.text, className)}
      role="status"
      aria-label="Loading…"
    />
  );
};

export const EventCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
    <div className="h-40 skeleton-shimmer" />
    <div className="p-4 space-y-3">
      <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-2/3 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton-shimmer h-2 w-full rounded-full" />
      <div className="skeleton-shimmer h-9 w-full rounded-full" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
    <div className="skeleton-shimmer w-12 h-12 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton-shimmer h-7 w-16 rounded" />
      <div className="skeleton-shimmer h-3 w-24 rounded" />
    </div>
  </div>
);

export default Skeleton;
