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

const isAncestorScollTarget = (target: EventTarget, node: Element) => {
  return target instanceof Node && node && isAncestor(node, target)
}

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
