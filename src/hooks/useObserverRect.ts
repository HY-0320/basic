import { MutableRefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { usePrevious } from './usePrevious'

export type UseObserverRect = Pick<
  DOMRectReadOnly,
  'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'
>
export type UseObserverRectRef<E extends Element = Element> = (element: E) => void
export type UseObserverRectListener = (rect: UseObserverRect) => void
export type UseObserverRectResult<E extends Element = Element> = [
  UseObserverRectRef<E>,
  UseObserverRect | null,
  MutableRefObject<UseObserverRectListener | null>,
  () => void
]

/**
 * 判断目标是否为全局滚动目标。
 *
 * @param target - 事件目标。
 * @returns 如果目标是全局滚动目标（document、document.documentElement 或 document.body），则返回 true；否则返回 false。
 */
const isGlobalScollTarget = (target: EventTarget) => {
  return (
    target instanceof Node &&
    (target === document || target === document.documentElement || target === document.body)
  )
}

function isAncestor(node: Node, ancestor: Node) {
  let current = node.parentNode
  while (current) {
    if (current === ancestor) {
      return true
    }
    current = current.parentNode
  }
  return false
}

/**
 * 判断目标元素是否为指定节点的祖先滚动目标。
 *
 * @param target - 事件目标。
 * @param node - 要检查的节点。
 * @returns 如果目标是节点的祖先滚动目标，则返回 true，否则返回 false。
 */
const isAncestorScollTarget = (target: EventTarget, node: Element) => {
  return target instanceof Node && node && isAncestor(node, target)
}

/**
 * 自定义 Hook，用于观察元素的矩形（bounding rect）变化。
 * 
 * @template E - 元素类型，默认为 Element。
 * 
 * @returns {UseObserverRectResult<E>} 返回一个包含以下元素的数组：
 * - `ref`：用于绑定到目标元素的引用。
 * - `rect`：目标元素的当前矩形信息。
 * - `listenRef`：用于监听矩形变化的回调函数引用。
 * - `reCalRect`：重新计算矩形的函数。
 * 
 * @example
 * ```typescript
 * const [ref, rect, listenRef, reCalRect] = useObserverRect<HTMLDivElement>();
 * 
 * useEffect(() => {
 *   if (rect) {
 *     console.log('Element rect:', rect);
 *   }
 * }, [rect]);
 * 
 * return <div ref={ref}>Observe me!</div>;
 * ```
 */
export function useObserverRect<E extends Element = Element>(): UseObserverRectResult<E> {
  const [element, ref] = useState<E | null>(null)
  const listenRef = useRef<UseObserverRectListener | null>(null)

  const [rect, setRect] = useState<UseObserverRect | null>(null)
  const [, preRectRef] = usePrevious(rect)

  const handleScroll = useCallback(
    (event: Event) => {
      if (
        event.target &&
        (isGlobalScollTarget(event.target) || isAncestorScollTarget(event.target, element!))
      ) {
        const newRect = element!.getBoundingClientRect()
        if (
          preRectRef.current == null ||
          newRect.top !== preRectRef.current.top ||
          newRect.left !== preRectRef.current.left
        ) {
          if (listenRef.current) {
            listenRef.current(newRect)
          }
          setRect(newRect)
        }
      }
    },
    [element, preRectRef]
  )

  const reCalRect = useCallback(() => {
    if (element) {
      setRect(element!.getBoundingClientRect())
    }
  }, [element])

  useLayoutEffect(() => {
    if (element) {
      setRect(element!.getBoundingClientRect())
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      if (element) {
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [element, handleScroll])

  return [ref, rect, listenRef, reCalRect]
}
