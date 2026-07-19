import { execSync } from "node:child_process";

// 构建版本号：用 git 短 sha。用于前端「有新版·点此刷新」检测——客户端把这个
// 内联的构建版本与线上 /version.json 比对，不同即提示刷新。
// 取不到（非 git 环境）时留空 → 前端据此完全禁用检测（fail-safe）。
let buildVersion = "";
try {
  buildVersion = execSync("git rev-parse --short HEAD", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {
  buildVersion = "";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，方便部署到 Cloudflare Pages / Vercel 静态托管
  // 如果之后加 API Route 或 ISR，再切回默认 SSR
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
  },
};

export default nextConfig;
