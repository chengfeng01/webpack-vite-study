// 声明全局变量类型（TS 项目必备，避免类型报错）
declare global {
  const __APP_VERSION__: string;
  interface Window {
    __APP_VERSION__: string; // 声明 window 上的属性
    checkForUpdates: () => Promise<void>; // 声明全局函数类型
  }
}

// 显式将注入的变量挂载到 window 上（关键步骤）
window.__APP_VERSION__ = __APP_VERSION__;

console.log("当前应用版本：", __APP_VERSION__);
console.log("已挂载到 window：", window.__APP_VERSION__);

// 显示更新提示弹窗
const showUpdateToast = () => {
  if (document.getElementById("update-notice-toast")) return;

  const toast = document.createElement("div");
  toast.id = "update-notice-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px 24px;
    background: #165DFF;
    color: white;
    border-radius: 8px;
    z-index: 9999;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
    transition: opacity 0.3s ease;
  `;
  toast.innerHTML = "📢 发现新版本，点击刷新获取最新功能";

  toast.onclick = () => {
    window.location.reload(true);
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  };

  document.body.appendChild(toast);
};

// 比对本地与服务器版本
const checkForUpdates = async () => {
  try {
    // 禁用缓存，确保获取最新的 version.txt
    const response = await fetch("/version.txt", { cache: "no-cache" });
    if (!response.ok) throw new Error(`请求失败：${response.status}`);

    const serverVersion = await response.text();
    if (serverVersion.trim() !== __APP_VERSION__) {
      console.log(
        `🔄 版本更新检测：本地=${__APP_VERSION__} → 服务器=${serverVersion}`
      );
      showUpdateToast();
    }
  } catch (error) {
    console.error("❌ 版本检查失败：", error);
  }
};

// 关键：将函数挂载到 window，使其在控制台可调用
window.checkForUpdates = checkForUpdates;

// 初始化执行：页面加载后检查 + 定时轮询
window.addEventListener("load", () => {
  checkForUpdates();
  setInterval(checkForUpdates, 30 * 1000);
});

export default checkForUpdates;
