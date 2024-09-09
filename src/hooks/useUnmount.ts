import { useRef } from 'react'
import { useEffectOnce } from './useEffectOnce'

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
