import React, { useEffect, useRef } from "react";

export function usePrevious<T>(
  value: T,
  initial?: T
): [T, React.MutableRefObject<T>] {
  const ref = useRef<T>(initial as T);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [ref.current, ref];
}
