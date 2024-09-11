import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import { useUniqueId } from "../hooks/useUniqueId";

export interface Props {
  children:
    | React.ReactNode
    | (({ isInView }: { isInView: boolean }) => React.ReactNode);
  width?: number;
  height?: number;
  onLoad?: () => void;
  onChange?: (isInView: boolean) => void;
  disabled?: boolean;
  // 开启时，只有在 isInView 和 conditional 为 false 的时候才会渲染
  conditional?: boolean;
}

export function LazyLoader({
  children,
  width,
  height,
  onLoad,
  onChange,
  disabled = false,
  conditional = false,
}: Props) {
  const id = useUniqueId();
  const [loaded, setLoaded] = useState(disabled);
  const [isInView, setIsInView] = useState(disabled);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cacheElRef = useRef<any>(null);

  // const ctx = useContext(DashboardContext)

  useEffect(() => {
    const wrapperEl = wrapperRef.current;

    if (!disabled) {
      LazyLoader.addCallback(id, (entry) => {
        if (!loaded && entry.isIntersecting) {
          setLoaded(true);
          onLoad?.();
        }

        setIsInView(entry.isIntersecting);
        onChange?.(entry.isIntersecting);
      });

      if (wrapperEl) {
        LazyLoader.observer.observe(wrapperEl);
      }
    }

    return () => {
      if (!disabled) {
        delete LazyLoader.callbacks[id];
        wrapperEl && LazyLoader.observer.unobserve(wrapperEl);
        if (Object.keys(LazyLoader.callbacks).length === 0) {
          LazyLoader.observer.disconnect();
        }
      }
    };
  }, [disabled, id, loaded, onChange, onLoad]);

  const el = useMemo(() => {
    // 这里必须缓存包含ctx的children，因为里面的组件触发渲染有props和ctx两种途径
    const nextEl = (
      // <DashboardContext.Provider value={ctx}>
      <>
        {loaded &&
          (typeof children === "function" ? children({ isInView }) : children)}
      </>
      // </DashboardContext.Provider>
    );
    if (isInView && !conditional) {
      cacheElRef.current = nextEl;
      return nextEl;
    }
    return cacheElRef.current;
  }, [children, conditional, isInView, loaded]);

  return (
    <div id={id} ref={wrapperRef} style={{ width, height }}>
      {el}
    </div>
  );
}

LazyLoader.callbacks = {} as Record<
  string,
  (e: IntersectionObserverEntry) => void
>;
LazyLoader.addCallback = (
  id: string,
  c: (e: IntersectionObserverEntry) => void
) => {
  LazyLoader.callbacks[id] = c;
};
LazyLoader.observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      LazyLoader.callbacks[entry.target.id](entry);
    }
  },
  { rootMargin: "100px" }
);
