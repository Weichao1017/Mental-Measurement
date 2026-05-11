import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "心理状态评估 · 疗愈课程入组测评",
  description:
    "结合 DASS-21、WHO-5、FFMQ-15、SCS-SF 等标准化量表的多维心理状态评估，为正念与疗愈课程提供基线参考。",
};

// Next.js 15 起 viewport 改为独立 export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
