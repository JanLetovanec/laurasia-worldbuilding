import { type PropsWithChildren, useRef } from "react";
import useGrab from "../../utils/useGrab.ts";
import css from "./Map.module.css";
import clsx from "clsx";

interface MapProps extends PropsWithChildren {
  className?: string;
}

export default function Map({ children, className }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { isGrabbing, translateX, translateY, scale } = useGrab(ref);

  const transform = `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;
  const cursor = isGrabbing ? "grabbing" : "grab";

  return (
    <div className={clsx(className, css.map)} style={{ cursor }} ref={ref}>
      <div style={{ transform }} className={css.transform}>
        {children}
      </div>
    </div>
  );
}
