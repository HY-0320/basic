import { DispatchWithoutAction, useReducer } from 'react'

/**
 * Custom hook that forces a component to re-render.
 *
 * This hook returns a function that, when called, will force the component
 * to re-render by updating the state with a new value.
 *
 * @returns {DispatchWithoutAction} A function that forces a re-render when invoked.
 */
export function useForceUpdate(): DispatchWithoutAction {
  const [, forceRender] = useReducer(s => s + 1, 0)
  return forceRender
}
