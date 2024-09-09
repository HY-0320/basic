import { useRef } from 'react'
import { useEffectOnce } from './useEffectOnce'

/**
 * 自定义 Hook：useUnmount
 * 
 * 在组件卸载时执行给定的回调函数，并返回一个包含卸载状态的引用和当前卸载状态的元组。
 * 
 * @param fn - 可选的回调函数，在组件卸载时执行。
 * @returns 一个元组，第一个元素是一个包含卸载状态的引用，第二个元素是当前卸载状态的布尔值。
 */
export const useUnmount = (fn?: () => any): [React.MutableRefObject<boolean>, boolean] => {
  const fnRef = useRef(fn)
  const isUnMountRef = useRef(false)

  fnRef.current = fn

  useEffectOnce(() => () => {
    if (fnRef.current) {
      fnRef.current()
    }
    isUnMountRef.current = true
  })

  return [isUnMountRef, isUnMountRef.current]
}
