export function _call(fn: Function, ...args: any[]) {
  // 判断是否是个 函数
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function');
  }

  const context = Object(this) ?? window
  const symbolKey = Symbol('key') // 生成一个唯一的 key 防止冲突
  context[symbolKey] = fn
  const result = context[symbolKey](...args) // 改变 this指向
  delete context[symbolKey]
  return result
}