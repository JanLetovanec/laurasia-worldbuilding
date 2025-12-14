import { type PropsWithChildren, useCallback, useRef, useState } from "react";
import useGrab from "../../utils/useGrab.ts";
import css from "./Map.module.css";
import clsx from "clsx";

interface MapProps extends PropsWithChildren {
  className?: string;
}

export default function Map({ children, className }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  const onGrabEnd = useCallback((offsetX: number, offsetY: number) => {
    setTranslateX((x) => x + offsetX);
    setTranslateY((y) => y + offsetY);
  }, []);

  const { isGrabbing, offsetX, offsetY } = useGrab(ref, onGrabEnd);

  const transform = `translateX(${translateX + offsetX}px) translateY(${translateY + offsetY}px)`;
  const cursor = isGrabbing ? "grabbing" : "grab";

  return (
    <div className={clsx(className, css.map)} style={{ cursor }} ref={ref}>
      <div style={{ transform }}>{children}</div>
    </div>
  );
}
