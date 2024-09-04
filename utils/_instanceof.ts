export function _instanceof(L, R) {
  if(typeof R !== 'function') {
    throw new TypeError(`${R} IS NOT CALLABLE`)
  }

  while(L.__proto__ !== null) {
    if(L.__proto__ === R.prototype) {
      return true
    }

    L = L.__proto__
  }

  return false
}