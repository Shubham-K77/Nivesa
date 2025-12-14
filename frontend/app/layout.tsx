import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import LenisProvider from "../components/custom/LenisProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Nivēśa",
  description: "Smart Financial Intelligence Platform",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black min-h-screen`}>
        <LenisProvider>{children}</LenisProvider>
        <Toaster />
      </body>
    </html>
  );
}
