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
  minScale: number = 1,
) {
  const [isGrabbing, setGrabbing] = useState<boolean>(false);
  const [initialGrabX, setInitialGrabX] = useState<number>(0);
  const [initialGrabY, setInitialGrabY] = useState<number>(0);
  const [currentGrabX, setCurrentGrabX] = useState<number>(0);
  const [currentGrabY, setCurrentGrabY] = useState<number>(0);

  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  const offsetX = currentGrabX - initialGrabX;
  const offsetY = currentGrabY - initialGrabY;

  const onGrabEnd = useCallback((offsetX: number, offsetY: number) => {
    setTranslateX((x) => x + offsetX);
    setTranslateY((y) => y + offsetY);
  }, []);

  const handleScroll = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      if (!container.current) {
        return;
      }

      const oldScale = scale;
      const newScale = Math.max(
        scale - event.deltaY / document.body.clientHeight,
        minScale,
      );

      if (newScale === oldScale) {
        return;
      }

      setScale(newScale);
      // TODO: When we scale, we should also translate to ensure that whatever we are mousing over stays in the same place when we scroll
    },
    [scale, minScale],
  );

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
    [initialGrabX, initialGrabY, currentGrabX, currentGrabY, onGrabEnd],
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
    container.current?.addEventListener("wheel", handleScroll);
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
      container.current?.removeEventListener("wheel", handleScroll);
      container.current?.removeEventListener("mousedown", handleGrabStart);
      container.current?.removeEventListener("touchstart", handleGrabStart);
      document.removeEventListener("mouseup", handleGrabStop);
      document.removeEventListener("touchend", handleGrabStop);
      document.removeEventListener("touchcancel", handleGrabStop);
      document.removeEventListener("mousemove", handleGrabMove);
      document.removeEventListener("touchmove", handleGrabMove);
    };
  }, [handleScroll, handleGrabStart, handleGrabStop, handleGrabMove]);

  useEffect(() => {
    document.body.style.cursor = isGrabbing ? "grabbing" : "default";
  }, [isGrabbing]);

  return useMemo(
    () => ({
      isGrabbing,
      translateX: translateX + offsetX,
      translateY: translateY + offsetY,
      scale,
    }),
    [isGrabbing, translateX, translateY, offsetX, offsetY, scale],
  );
}
