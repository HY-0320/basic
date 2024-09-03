import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();
const PromiseComponent = lazy(() => import("./promise"));

history.listen(({ location, action }) => {
  console.log("🚀 ~ history.listen ~ action:", action)
  console.log("🚀 ~ history.listen ~ location:", location)
  // this is called whenever new locations come in
  // the action is POP, PUSH, or REPLACE
});

// 如果不需要树形结构的组件放TreeRoute上面
function App() {
  const router = createBrowserRouter([
    {
      path: "/demos/promise",
      element: (
        <Suspense fallback={<div>loading</div>}>
          <PromiseComponent history={history} />
        </Suspense>
      ),
      errorElement: <div>error</div>,
    },
  ]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("app")!).render(<App />);
