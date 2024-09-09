import React from "react";
import { myNew } from "@utils";

function PromiseComponent(props: any) {
  // 新建一个 Promise 类 或者对象
  myNew(Number);

  return <div>promise</div>;
}

export default PromiseComponent;
