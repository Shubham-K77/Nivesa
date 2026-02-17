//Icons:
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-linear-to-b from-gray-900/90 to-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-10">
          {/* Logo, description, socials */}
          <div className="lg:col-span-2 flex flex-col gap-y-6">
            {/* Logo & Title display */}
            <div className="flex items-center gap-x-3">
              {/* Logo */}
              <div
                className="w-14 h-14 md:w-16 md:h-16 bg-transparent"
                style={{
                  backgroundImage: `url(/images/logo.png)`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              {/* Title */}
              <h2 className="font-bold text-3xl md:text-4xl text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">
                Nivēśa
              </h2>
            </div>
            {/* Description */}
            <p className="text-sm md:text-base text-gray-400/90 leading-relaxed max-w-md">
              Manage your finances smarter with Nivēśa, an AI-powered expense
              tracker that delivers personalized financial insights and helps
              you navigate your daily spending with ease and confidence.
            </p>
            {/* Social Section */}
            <div className="flex gap-3">
              {/* Facebook */}
              <button className="w-12 h-12 rounded-full bg-gray-700/30 border border-gray-600/50 flex justify-center items-center hover:bg-linear-to-br hover:from-yellow-400 hover:to-amber-500 hover:border-transparent transition-all duration-200 hover:scale-110 group">
                <FaFacebookF className="text-xl text-gray-200 group-hover:text-gray-900" />
              </button>
              {/* X */}
              <button className="w-12 h-12 rounded-full bg-gray-700/30 border border-gray-600/50 flex justify-center items-center hover:bg-linear-to-br hover:from-yellow-400 hover:to-amber-500 hover:border-transparent transition-all duration-200 hover:scale-110 group">
                <FaXTwitter className="text-xl text-gray-200 group-hover:text-gray-900" />
              </button>
              {/* LinkedIn */}
              <button className="w-12 h-12 rounded-full bg-gray-700/30 border border-gray-600/50 flex justify-center items-center hover:bg-linear-to-br hover:from-yellow-400 hover:to-amber-500 hover:border-transparent transition-all duration-200 hover:scale-110 group">
                <FaLinkedinIn className="text-xl text-gray-200 group-hover:text-gray-900" />
              </button>
            </div>
          </div>

          {/* Product, Company, Legal */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Product */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                Product
              </h3>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Features
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                How it Works
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Pricing
              </button>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                Company
              </h3>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                About Us
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Blog
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Contact
              </button>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                Legal
              </h3>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Privacy Policy
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Cookie Policy
              </button>
              <button className="text-sm md:text-base text-gray-400/90 hover:text-amber-400 transition-colors duration-200 text-left">
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Copyright and Logo */}
        <div className="pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400/90 text-center sm:text-left">
            © 2025 Shubham Kadariya. All rights reserved.
          </p>
          <div
            className="w-16 h-16 md:w-20 md:h-20 bg-transparent opacity-60 hover:opacity-100 transition-opacity duration-200"
            style={{
              backgroundImage: `url('/images/initials.png')`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
          ></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
