import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const getGrabPositionFromEvent = (
  event: MouseEvent | TouchEvent,
): Readonly<[number, number]> | null => {
  if (event instanceof MouseEvent) {
    return [event.clientX, event.clientY];
  } else if (event.touches.length === 1) {
    const touch = event.touches[0];

    return [touch.clientX, touch.clientY];
  }

  return null;
};

export default function useGrab(
  container: RefObject<HTMLElement | null>,
  onGrabEnd: (offsetX: number, offsetY: number) => void,
) {
  const [isGrabbing, setGrabbing] = useState<boolean>(false);
  const [initialGrabX, setInitialGrabX] = useState<number>(0);
  const [initialGrabY, setInitialGrabY] = useState<number>(0);
  const [currentGrabX, setCurrentGrabX] = useState<number>(0);
  const [currentGrabY, setCurrentGrabY] = useState<number>(0);

  const offsetX = currentGrabX - initialGrabX;
  const offsetY = currentGrabY - initialGrabY;

  const handleGrabStart = useCallback((event: MouseEvent | TouchEvent) => {
    if (!container.current) {
      return;
    }

    const position = getGrabPositionFromEvent(event);
    if (!position) {
      return;
    }

    event.preventDefault();

    const [clientX, clientY] = position;

    const x = clientX - container.current?.clientLeft;
    const y = clientY - container.current?.clientTop;

    setInitialGrabX(x);
    setInitialGrabY(y);
    setCurrentGrabX(x);
    setCurrentGrabY(y);
    setGrabbing(true);
  }, []);

  const handleGrabStop = useCallback(
    (_: MouseEvent | TouchEvent) => {
      setGrabbing(false);

      const offsetX = currentGrabX - initialGrabX;
      const offsetY = currentGrabY - initialGrabY;

      // Reset the initial and current grab to set offset to 0
      setInitialGrabX(0);
      setInitialGrabY(0);
      setCurrentGrabX(0);
      setCurrentGrabY(0);

      onGrabEnd(offsetX, offsetY);
    },
    [initialGrabX, initialGrabY, currentGrabX, currentGrabY],
  );

  const handleGrabMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!container.current) {
        return;
      }

      if (!isGrabbing) {
        return;
      }

      const position = getGrabPositionFromEvent(event);
      if (!position) {
        return;
      }

      const [clientX, clientY] = position;

      const x = clientX - container.current?.clientLeft;
      const y = clientY - container.current?.clientTop;

      setCurrentGrabX(x);
      setCurrentGrabY(y);
    },
    [isGrabbing],
  );

  useEffect(() => {
    container.current?.addEventListener("mousedown", handleGrabStart);
    container.current?.addEventListener("touchstart", handleGrabStart);
    document.addEventListener("mouseup", handleGrabStop, {
      passive: true,
    });
    document.addEventListener("touchend", handleGrabStop, {
      passive: true,
    });
    document.addEventListener("touchcancel", handleGrabStop, {
      passive: true,
    });
    document.addEventListener("mousemove", handleGrabMove, {
      passive: true,
    });
    document.addEventListener("touchmove", handleGrabMove, {
      passive: true,
    });

    return () => {
      container.current?.removeEventListener("mousedown", handleGrabStart);
      container.current?.removeEventListener("touchstart", handleGrabStart);
      document.removeEventListener("mouseup", handleGrabStop);
      document.removeEventListener("touchend", handleGrabStop);
      document.removeEventListener("touchcancel", handleGrabStop);
      document.removeEventListener("mousemove", handleGrabMove);
      document.removeEventListener("touchmove", handleGrabMove);
    };
  }, [handleGrabStart, handleGrabStop, handleGrabMove]);

  useEffect(() => {
    document.body.style.cursor = isGrabbing ? "grabbing" : "default";
  }, [isGrabbing]);

  return useMemo(
    () => ({
      isGrabbing,
      offsetX,
      offsetY,
    }),
    [isGrabbing, offsetX, offsetY],
  );
}
