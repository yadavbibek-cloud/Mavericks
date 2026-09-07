import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GridSense — National Grid Intelligence Platform",
  description: "Real-Time Causal AI, Graph Neural Networks, and Digital Twin for Power Grid Cascading Failure Prediction, Root-Cause Disambiguation, and What-If Mitigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-gs-bg-primary text-gs-text-primary antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
