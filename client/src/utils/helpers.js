import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ── Date helpers ──────────────────────────────────────────────────────────

/**
 * Safely format a date. Returns '' on invalid input.
 * @param {string|Date|null} date
 * @param {string} formatStr - date-fns format string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, formatStr) : '';
  } catch {
    return '';
  }
};

/**
 * Human-readable relative time (e.g. "3 hours ago").
 * Returns '' on invalid input.
 */
export const formatRelative = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
  } catch {
    return '';
  }
};

// ── String helpers ────────────────────────────────────────────────────────

/**
 * Truncate a string to maxLength characters, appending '…' if truncated.
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str ?? '';
  return `${str.slice(0, maxLength).trimEnd()}…`;
};

/**
 * Get up to 2 uppercase initials from a full name.
 * "Jane Doe" → "JD", "Alice" → "A"
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
};

// ── Number / currency helpers ─────────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 * formatCurrency(1500) → "₹1,500"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// ── Event / status colour helpers ─────────────────────────────────────────

/**
 * Map an EventCategory to Tailwind background + text colour classes.
 */
export const getEventCategoryColor = (category) => {
  const map = {
    TECHNICAL:      'bg-blue-100   text-blue-700',
    CULTURAL:       'bg-pink-100   text-pink-700',
    SPORTS:         'bg-green-100  text-green-700',
    WORKSHOP:       'bg-amber-100  text-amber-700',
    SEMINAR:        'bg-cyan-100   text-cyan-700',
    GUEST_LECTURE:  'bg-violet-100 text-violet-700',
    CLUB:           'bg-fuchsia-100 text-fuchsia-700',
    PLACEMENT:      'bg-slate-100  text-slate-700',
    AWARD_CEREMONY: 'bg-yellow-100 text-yellow-700',
    COMPETITION:    'bg-red-100    text-red-700',
    OTHER:          'bg-gray-100   text-gray-600',
  };
  return map[category] ?? map.OTHER;
};

/**
 * Map a registration/event status to a Badge variant string.
 * These variant strings must match the variants accepted by Badge.jsx.
 */
export const getStatusColor = (status) => {
  const map = {
    // Registration statuses
    PENDING:    'warning',
    APPROVED:   'success',
    WAITLISTED: 'info',
    ATTENDED:   'purple',
    REJECTED:   'danger',
    // Event statuses
    DRAFT:      'default',
    PUBLISHED:  'success',
    ONGOING:    'info',
    COMPLETED:  'purple',
    CANCELLED:  'danger',
  };
  return map[status] ?? 'default';
};

// ── Blob download helper ──────────────────────────────────────────────────

/**
 * Create a temporary object URL for a Blob, trigger a download,
 * then revoke after 100ms so the browser has time to start the download.
 */
export const downloadBlob = (blob, filename) => {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// ── CSS class merge utility ───────────────────────────────────────────────

/**
 * Lightweight classnames utility — joins truthy class strings.
 * No dependency needed.
 *
 * cn('foo', false && 'bar', 'baz') → 'foo baz'
 */
export const cn = (...classes) =>
  classes.filter(Boolean).join(' ');

// ── Error message extractor ───────────────────────────────────────────────

/**
 * Extract a human-readable message from an axios error or any Error object.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  // Axios error with server response
  if (error.response?.data?.message) return error.response.data.message;
  // Axios error with array of validation errors
  if (error.response?.data?.errors?.[0]?.message) {
    return error.response.data.errors[0].message;
  }
  // Generic JS error
  if (error.message) return error.message;
  return 'An unexpected error occurred.';
};
