import { useState, useEffect } from 'react';

/**
 * Returns true while the given CSS media query matches.
 * Cleans up the event listener on unmount.
 *
 * @param {string} query - CSS media query string, e.g. '(max-width: 1024px)'
 * @returns {boolean}
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 1024px)');
 */
const useMediaQuery = (query) => {
  const getMatches = () => {
    // SSR guard — window is unavailable during server rendering
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler    = (e) => setMatches(e.matches);

    // addEventListener with { passive: true } for performance
    mediaQuery.addEventListener('change', handler);

    // Sync on mount in case the query result changed between useState init and effect
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMediaQuery;
