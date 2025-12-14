"use client";
//Importing custom components:
import Footer from "@/components/custom/Footer";
import Navbar from "@/components/custom/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "../../actions/users.api";
import { toast } from "sonner";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  //Constant:
  const router = useRouter();
  //UseEffect To Fetch The Current User:
  useEffect(() => {
    const getActiveUser = async () => {
      const response = await getCurrentUser();
      if (response.data?.statusCode === 200) {
        toast.info("User is already logged in.");
        return router.push("/home");
      }
    };
    getActiveUser();
  }, [router]);
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
