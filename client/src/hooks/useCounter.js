import { useEffect, useState, useRef } from 'react';

export default function useCounter(target, duration = 1500, isVisible = false) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isVisible || started.current) return;
    started.current = true;
    const num = parseInt(String(target).replace(/\D/g, '')) || 0;
    if (num === 0) { setCount(target); return; }
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return count;
}
