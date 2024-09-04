// 重写new 函数
/**
 * @name: 重写new 函数
 * @description: 
// 1. 创建一个全新的对象
// 2. 将这个新对象作为this的指向
// 3. 执行构造函数
// 4. 如果构造函数返回的是一个对象，则返回这个对象，否则返回创建了一个全新的对象
 * @param fn
 * @param args
 */

function _New(fn: any, ...args: any[]) {
  // 判断 fn 是否是个函数
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }
  // 生成一个全新的对象
  const newObj = Object.create(fn.prototype)
  // 执行构造函数
  const result = fn.apply(newObj, args)
  // 如果构造函数返回的是一个对象，则返回这个对象，否则返回创建了一个全新的对象
  return result instanceof Object ? result : newObj
}

export const myNew = _New