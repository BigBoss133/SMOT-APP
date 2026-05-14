import { useEffect, useReducer } from 'react';

type Action = { index: number } | { reset: number };

function staggerReducer(state: boolean[], action: Action): boolean[] {
  if ('reset' in action) {
    return Array(action.reset).fill(false);
  }
  const next = [...state];
  next[action.index] = true;
  return next;
}

export function useStaggerAnimation(count: number, delay = 80) {
  const [visible, dispatch] = useReducer(staggerReducer, count, (c: number) => Array(c).fill(false));

  useEffect(() => {
    dispatch({ reset: count });
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => dispatch({ index: i }), i * delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [count, delay]);

  return visible;
}
