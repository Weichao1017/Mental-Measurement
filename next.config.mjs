/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，方便部署到 Cloudflare Pages / Vercel 静态托管
  // 如果之后加 API Route 或 ISR，再切回默认 SSR
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
