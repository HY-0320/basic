export function _call(ctx, ...args) {
  if (typeof this !== "function") {
    throw new TypeError(`${this} is not function`);
  }

  const context = Object(ctx) || globalThis;
  const symbolKey = Symbol("key");
  context[symbolKey] = this;

  const result = context[symbolKey](...args);
  delete context[symbolKey];
  return result;
}

// @ts-ignore
Function.prototype._call = _call
