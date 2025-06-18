import { useRef } from 'react';

export function useLongPress(onLongPress, onClick, delay = 600) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown  = (e, item) => {
    longPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress(e, item);
    }, delay);
  };

  const handlePointerUp  = (e, item) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!longPressTriggered.current && e.button !== 2 && onClick) {
      onClick(e, item);
    }
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp
  };
}
