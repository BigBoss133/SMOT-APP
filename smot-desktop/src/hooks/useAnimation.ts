import { useEffect, useState } from 'react';

export function useStaggerAnimation(count: number, delay = 80) {
  const [visible, setVisible] = useState<boolean[]>(Array(count).fill(false));

  useEffect(() => {
    setVisible(Array(count).fill(false));
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
