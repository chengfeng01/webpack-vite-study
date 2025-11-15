import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./utils/updateChecker"; // 引入更新检查逻辑

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
