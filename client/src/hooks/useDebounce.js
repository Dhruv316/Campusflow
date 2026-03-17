import { useState, useEffect } from 'react';

/**
 * Debounce a value by the given delay (ms).
 * The returned value only updates after the input has been stable for `delay` ms.
 *
 * @param {*}      value  - The value to debounce
 * @param {number} delay  - Debounce delay in milliseconds (default: 400)
 * @returns Debounced value
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
