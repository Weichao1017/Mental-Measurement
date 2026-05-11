import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Container({ children, size = "md" }: Props) {
  const widths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };
  return (
    <main className={`mx-auto w-full px-5 py-8 sm:px-6 sm:py-12 ${widths[size]}`}>
      {children}
    </main>
  );
}
