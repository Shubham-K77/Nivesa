import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import LenisProvider from "../components/custom/lenisProvider";
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
      <body
        className={`${inter.className} antialiased bg-gray-900 min-h-screen`}
      >
        <LenisProvider>{children}</LenisProvider>
        <Toaster
          toastOptions={{
            style: {
              background: "#334155",
              color: "#f3f4f6",
              borderRadius: "0.75rem",
              border: "2px solid #6b7280",
            },
          }}
        />
      </body>
    </html>
  );
}
