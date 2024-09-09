import React, { useEffect, useRef } from "react";

/**
 * 自定义 Hook，用于获取前一个状态值。
 *
 * @template T - 状态值的类型。
 * @param {T} value - 当前的状态值。
 * @param {T} [initial] - 初始状态值，可选。
 * @returns {[T, React.MutableRefObject<T>]} 返回一个包含前一个状态值和一个可变引用对象的数组。
 */
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
