// 重写 instanceof

export function _instanceof(L: any, R: any) {
  // 判断一下 R 是否是个function
  if(typeof R !== 'function') {
    throw new TypeError('Right-hand side of \'instanceof\' is not callable');
  }

  while(L.__proto__ !== null) {
    if(L.__proto__ === R.prototype) {
      return true
    }

    L = L.__proto__
  }

  return false
}