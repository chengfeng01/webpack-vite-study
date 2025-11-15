import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import type { Compiler } from "@rspack/core"; // 导入 Rspack 编译器类型

// 1. 获取 Git Commit Hash 作为版本标识（不变）
const getAppVersion = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    console.warn("⚠️  获取 Git 版本失败，使用时间戳替代");
    return Date.now().toString();
  }
};

const appVersion = getAppVersion();

// 2. 自定义 Rspack 插件：在构建完成后生成 version.txt（替代 api.onAfterBuild）
const generateVersionFilePlugin = {
  name: "generate-version-file-plugin", // 插件名称（必填）
  apply: (compiler: Compiler) => {
    // 监听 Rspack 的 afterEmit 钩子（所有文件输出到磁盘后触发）
    compiler.hooks.afterEmit.tap("GenerateVersionFile", (compilation) => {
      // 获取 dist 目录路径（从 Rspack 编译配置中读取）
      const distPath = compilation.options.output.path as string;
      const versionFilePath = join(distPath, "version.txt");
      writeFileSync(versionFilePath, appVersion);
      console.log(`✅ 已生成版本文件：${versionFilePath}`);
    });
  },
};

// 3. 官网规范配置（所有字段均在 RsbuildConfig 类型中存在）
export default defineConfig({
  plugins: [pluginReact()], // 保留 React 插件
  // 官网合法配置：source.define 注入全局变量（类型完全兼容）
  source: {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
  },
  // 优化输出文件名（配合缓存策略）
  output: {
    filename: {
      js: "static/js/[name].[contenthash:8].js",
      css: "static/css/[name].[contenthash:8].css",
    },
  },
  // 关键：通过 tools.rspack.plugins 添加自定义插件（注册钩子）
  tools: {
    rspack: {
      plugins: [generateVersionFilePlugin], // 加入自定义插件
    },
  },
});
