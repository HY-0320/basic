import { EffectCallback, useEffect } from "react";

/**
 * 只在组件挂载时执行一次的自定义 Hook。
 *
 * @param effect - 要执行的副作用回调函数。
 */
export const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
}