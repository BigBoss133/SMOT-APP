import { useEffect, useRef, useState } from 'react';

export function useStaggerAnimation(count: number, delay = 80) {
  const prevCount = useRef(count);
  const [visible, setVisible] = useState<boolean[]>(() => Array(count).fill(false));

  useEffect(() => {
    if (prevCount.current !== count) {
      prevCount.current = count;
      setVisible(Array(count).fill(false));
    }
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [count, delay]);

  return visible;
}
