"use client";
//Importing custom components:
import Footer from "@/components/custom/Footer";
import Navbar from "@/components/custom/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
//Tanstack Query
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  const { data, isLoading } = useQuery(getActiveUser());
  const statusCode = data?.data?.statusCode;

  useEffect(() => {
    if (statusCode === 200) {
      router.push("/home");
    }
  }, [statusCode, router]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className="w-full flex flex-col min-h-screen justify-start items-center bg-gray-900 text-white">
        {/* Header */}
        <Navbar />
        {/* Main */}
        {children}
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
