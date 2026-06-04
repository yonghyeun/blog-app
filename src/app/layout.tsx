import type { Metadata } from "next";

import { fontClassName } from "@/shared/ui/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Developer Growth Blog",
  description: "Personal developer growth blog application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
