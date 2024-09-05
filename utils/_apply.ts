export function _apply(ctx, args) {
  if(typeof this !== 'function') {
    throw new TypeError(`${this} is not function`)
  }

  const context = Object(ctx) || globalThis
  const symbolKey = Symbol('KEY')
  context[symbolKey] = this
  const res = context[symbolKey](...args)
  delete context[symbolKey]
  return res
}

// @ts-ignore
Function.prototype._apply = _apply
