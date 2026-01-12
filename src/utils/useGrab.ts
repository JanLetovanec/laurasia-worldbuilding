import { type RefObject, useCallback, useEffect, useMemo } from "react";
import { useImmer } from "use-immer";

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

interface GrabState {
  isGrabbing: boolean;
  initialGrabX: number;
  initialGrabY: number;
  currentGrabX: number;
  currentGrabY: number;
  translateX: number;
  translateY: number;
  scale: number;
}

const DEFAULT_STATE: GrabState = {
  isGrabbing: false,
  initialGrabX: 0,
  initialGrabY: 0,
  currentGrabX: 0,
  currentGrabY: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
};

export default function useGrab(
  container: RefObject<HTMLElement | null>,
  minScale: number = 1,
) {
  const [
    {
      isGrabbing,
      initialGrabX,
      initialGrabY,
      currentGrabX,
      currentGrabY,
      translateX,
      translateY,
      scale,
    },
    setState,
  ] = useImmer<GrabState>(DEFAULT_STATE);

  const offsetX = currentGrabX - initialGrabX;
  const offsetY = currentGrabY - initialGrabY;

  const onGrabEnd = useCallback((offsetX: number, offsetY: number) => {
    setState((draft) => {
      draft.translateX += offsetX;
      draft.translateY += offsetY;
    });
  }, []);

  const handleScroll = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      setState((draft) => {
        if (!container.current) {
          return;
        }

        const oldScale = draft.scale;
        const newScale = Math.max(
          draft.scale - event.deltaY / document.body.clientHeight,
          minScale,
        );

        if (newScale === oldScale) {
          return;
        }

        const mouseX = event.clientX - container.current.clientLeft;
        const mouseY = event.clientY - container.current.clientTop;

        const centreX =
          container.current.clientLeft +
          container.current.clientWidth / 2 +
          draft.translateX +
          draft.currentGrabX -
          draft.initialGrabX;
        const centreY =
          container.current.clientTop +
          container.current.clientHeight / 2 +
          draft.translateY +
          draft.currentGrabY -
          draft.initialGrabY;

        const scaleFactor = 1 - oldScale / newScale;

        const deltaX = centreX - mouseX;
        const deltaY = centreY - mouseY;

        const translationOffsetX = deltaX * scaleFactor;
        const translationOffsetY = deltaY * scaleFactor;

        draft.scale = newScale;
        draft.translateX += translationOffsetX;
        draft.translateY += translationOffsetY;
      });
    },
    [minScale],
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

    setState((draft) => {
      draft.initialGrabX = x;
      draft.initialGrabY = y;
      draft.currentGrabX = x;
      draft.currentGrabY = y;
      draft.isGrabbing = true;
    });
  }, []);

  const handleGrabStop = useCallback(
    (_: MouseEvent | TouchEvent) => {
      setState((draft) => {
        draft.isGrabbing = false;

        const offsetX = draft.currentGrabX - draft.initialGrabX;
        const offsetY = draft.currentGrabY - draft.initialGrabY;

        // Reset the initial and current grab to set offset to 0
        draft.initialGrabX = 0;
        draft.initialGrabY = 0;
        draft.currentGrabX = 0;
        draft.currentGrabY = 0;

        onGrabEnd(offsetX, offsetY);
      });
    },
    [onGrabEnd],
  );

  const handleGrabMove = useCallback((event: MouseEvent | TouchEvent) => {
    setState((draft) => {
      if (!container.current) {
        return;
      }

      if (!draft.isGrabbing) {
        return;
      }

      const position = getGrabPositionFromEvent(event);
      if (!position) {
        return;
      }

      const [clientX, clientY] = position;

      const x = clientX - container.current?.clientLeft;
      const y = clientY - container.current?.clientTop;

      draft.currentGrabX = x;
      draft.currentGrabY = y;
    });
  }, []);

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
  }, [handleGrabStart, handleGrabStop, handleGrabMove]);

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
