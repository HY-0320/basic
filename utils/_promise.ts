// 手写 Promise
/*
    1. 状态：
       1. 初始状态： pending
       2. 成功状态： fulfilled
       3. 失败状态： rejected
       4. 只有一个状态，状态改变后无法再被改变
       5. 异步错误无法被捕获
    2. then:
       1. then 方法接收两个参数，第一个参数是成功回调，第二个参数是失败回调
       2. 返回一个新的 Promise， 并且可以多次调用
       3. 返回的 Promise 的状态取决于 then 参数里面的类型then(onFulfilled, onRejected)
          . 如果 onFulfilled 和 onRejected 不是函数， 则新返回的 Promise 的状态和当前 promise 一致
          · 如果 运行过程中报错，则新返回的 Promise 的状态为 rejected
          · 如果 onFulfilled 和 onRejected 都是函数，则新返回的 Promise 的状态为 fulfilled
       4. then 方法可以多次调用
    3. catch
      本质就是 调用 this.then(undefined, onRejected)
    4. finally
    5. all
    6.allsettled
    7. race
    8. resolve
    9. reject
*/

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

interface HandlerCallback {
  onFulfilled: (value: any) => void | any;
  onRejected: (value: any) => void | any;
  resolve: (value: any) => void;
  reject: (value: any) => void;
}

export class _Promise {
  #state = PENDING;
  #reslut = undefined;
  #onHandlerCallbacks: HandlerCallback[] = [];

  constructor(executor) {
    // 这里一定要绑定 this，不然会导致在执行 executor 中 this 指向 window
    try {
      executor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (error) {
      // 执行期间报错，则直接 reject
      // 注意异步错误是无法被 catch 捕获
      this.#reject(error);
    }
  }

  #resolve(data: any) {
    // 改变当前的状态为 fulfilled
    this.#changedState(FULFILLED, data); // 改变状态
  }

  #reject(data: any) {
    // 改变当前的状态为 rejected
    this.#changedState(REJECTED, data); // 改变状态
  }

  // Promise 的状态改变了, 触发相关的钩子函数
  #changedState(newState: string, newData: any) {
    if (this.#state === PENDING) {
      this.#state = newState;
      this.#reslut = newData;

      this.#run();
    }
  }

  // 执行onHandlerCallbacks数组
  #run() {
    if (this.#state === PENDING) return; // 状态未改变

    // 便利钩子函数数组，分别执行
    while (this.#onHandlerCallbacks.length > 0) {
      const handlerCallback = this.#onHandlerCallbacks.shift(); // 取出callback
      if (!handlerCallback) {
        continue;
      }
      const { onFulfilled, onRejected, resolve, reject } = handlerCallback;
      if (this.#state === FULFILLED) {
        this.#runOnce(onFulfilled, resolve, reject);
      } else if (this.#state === REJECTED) {
        this.#runOnce(onRejected, resolve, reject);
      }
    }
  }
  // . 如果 onFulfilled 和 onRejected 不是函数， 则新返回的 Promise 的状态和当前 promise 一致
  // · 如果 是函数运行过程中报错，则新返回的 Promise 的状态为 rejected
  // · 如果 onFulfilled 和 onRejected 都是函数，则新返回的 Promise 的状态为 fulfilled
  #runOnce(callback, resolve, reject) {
    this.#runMicroTask(() => {
      try {
        if (typeof callback !== "function") {
          this.#state === FULFILLED
            ? resolve(this.#reslut)
            : reject(this.#reslut);
        } else {
          const res = callback(this.#reslut);
          // 如果是 promise 对象
          if (this.#isPromiseLike(res)) {
            res.then(resolve, reject);
          } else {
            resolve(res);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  #isPromiseLike(data) {
    return typeof data === "object" && typeof data.then === "function";
  }

  // 微队列执行
  // 在 node 环境里面，可以使用 process.nextTick
  // 在浏览器环境里面，可以使用 MutationObserver
  // 如果都不支持就用 setTimeout
  #runMicroTask(fn) {
    // 判断当前环境
    if (process && process?.nextTick) {
      process.nextTick(fn);
    } else if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(fn);
      const textNode = document.createTextNode("1");
      observer.observe(textNode, {
        characterData: true,
      });
      textNode.data = "2";
    } else {
      setTimeout(fn, 0);
    }
  }

  // 暴露出去的 then 方法
  then(onFulfilled, onRejected) {
    return new _Promise((resolve, reject) => {
      this.#onHandlerCallbacks.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });
      this.#run();
    });
  }


  // catch 方法
  catch(callback) {
    return this.then(undefined, callback)
  }

  // resolve 方法
  // 1. 如果 value 是个 promise 直接返回
  // 2. 如果 value 是个 promise like(满足 PromiseA+ 规范) 则返回一个新的 Promise，且他的状态由value.then()来决定
  // 3. 其他就直接返回一个新的 Promise，且他的状态为 fulfilled， resolve(data)
  resolve(value) {
    if(value instanceof _Promise) return value

    if(this.#isPromiseLike(value)) return new _Promise((resolve, reject) => {
      value.then(resolve, reject)
    })

    return new _Promise((resolve) => resolve(value))

  }

// reject 方法
// 不管什么情况 都直接返回一个新的 Promise, 且他的状态为 reject， reject(value)
  reject(value) {
    return new _Promise((_, reject) => reject(value))
  }
}

const promise = new Promise((resolve, reject) => {
  resolve(1)
}).then((value) => {
  console.log(value);
}).catch(() => {});


const promise2 = new _Promise((resolve, reject) => {
  resolve(1)
}).then((value) => {
  console.log(value);
}, undefined).catch(() => {});

console.log("🚀 ~  原生promise ~ promise:", promise)
console.log("🚀 ~ 自己写promise ~ promise:", promise2)
