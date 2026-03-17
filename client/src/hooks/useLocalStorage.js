import { useState, useCallback } from 'react';

/**
 * Persisted state hook backed by localStorage.
 * API is identical to useState: returns [value, setValue].
 *
 * - Reads the stored value on mount (with JSON.parse + error guard)
 * - Writes back on every update
 * - Falls back to initialValue on any parse/read error
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - Default value if key is absent or unparseable
 */
const useLocalStorage = (key, initialValue) => {
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value;
        setStoredValue(next);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // localStorage can throw in private mode or when storage is full
        console.warn(`[useLocalStorage] Failed to write key "${key}"`);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
