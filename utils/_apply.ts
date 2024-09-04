export function _apply(fn: Function, args: any[]) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }

  const context = Object(this) ?? window
  const symbolKey = Symbol('key')

  context[symbolKey] = fn
  const result = context[symbolKey](...args)
  delete context[symbolKey]
  return result
}