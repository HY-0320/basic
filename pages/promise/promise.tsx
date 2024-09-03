import React from "react";
import { myNew } from "../../utils";

function PromiseComponent(props: any) {
  // 新建一个 Promise 类 或者对象

  function NewPromise() {
    // if (new.target === undefined) {
    //   throw new TypeError("Promises must be constructed via new");
    // }

    return 1
  }

  const promise = new NewPromise();
  const promise2 = myNew(NewPromise);
  console.log("🚀 ~ PromiseComponent ~ promise:", promise.__proto__ === NewPromise.prototype);


  console.log("🚀 ~ PromiseComponent ~ promise2:", promise2.__proto__ === NewPromise.prototype)
  return <div>promise</div>;
}

export default PromiseComponent;
