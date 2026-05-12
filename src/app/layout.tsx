import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LangProvider } from "@/lib/lang";
import LangSwitcher from "@/components/LangSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "心理状态评估 · Mental Measurement",
  description:
    "Multi-dimensional psychological assessment integrating DASS-21, WHO-5, GAD-7, PHQ-9, MDQ, ASRS and 9 more standardized scales. Bilingual (中文 / English).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body>
        <LangProvider>
          <LangSwitcher />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
