import { useState, useCallback, useRef } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface SwipeGestureState {
  isDragging: boolean;
  startX: number;
  currentX: number;
  deltaX: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: SwipeGestureOptions) {
  const [gestureState, setGestureState] = useState<SwipeGestureState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    deltaX: 0,
  });

  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientX: number) => {
    setGestureState({
      isDragging: true,
      startX: clientX,
      currentX: clientX,
      deltaX: 0,
    });
  }, []);

  const handleMove = useCallback((clientX: number) => {
    setGestureState((prev) => {
      if (!prev.isDragging) return prev;
      const deltaX = clientX - prev.startX;
      return {
        ...prev,
        currentX: clientX,
        deltaX,
      };
    });
  }, []);

  const handleEnd = useCallback(() => {
    setGestureState((prev) => {
      if (!prev.isDragging) return prev;

      const { deltaX } = prev;
      const absDellaX = Math.abs(deltaX);

      if (absDellaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      return {
        isDragging: false,
        startX: 0,
        currentX: 0,
        deltaX: 0,
      };
    });
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const gestures = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    },
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      handleStart(e.touches[0].clientX);
    },
  };

  const globalGestures = {
    onMouseMove: (e: MouseEvent) => {
      if (gestureState.isDragging) {
        handleMove(e.clientX);
      }
    },
    onTouchMove: (e: TouchEvent) => {
      if (gestureState.isDragging) {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    },
    onMouseUp: () => {
      if (gestureState.isDragging) {
        handleEnd();
      }
    },
    onTouchEnd: () => {
      if (gestureState.isDragging) {
        handleEnd();
      }
    },
  };

  return {
    gestures,
    globalGestures,
    gestureState,
    elementRef,
  };
}
