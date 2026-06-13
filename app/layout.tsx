import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIC — Portfolio Advisor",
  description: "Vic Investment Club · Get your personalised ETF portfolio in 2 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
