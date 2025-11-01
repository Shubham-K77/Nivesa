//Importing custom components:
import Footer from "@/components/custom/footer";
import Navbar from "@/components/custom/navbar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
