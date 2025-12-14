//Icons:
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="w-full md:h-[70vh] lg:h-[75vh] bg-gray-800/80 flex flex-col justify-center items-center border-t border-gray-700">
      {/* Main div   */}
      <div className="w-[95%] md:w-[90%] lg:w-[85%] md:h-[63vh] lg:h-[68vh] bg-transparent flex flex-col justify-center items-center p-2">
        {/* Content div */}
        <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 md:h-[70%] lg:h-[75%] bg-transparent gap-x-2 gap-y-6 md:gap-y-4 mb-2">
          {/* Logo, description, socials */}
          <div className="md:col-span-1 lg:col-span-2 h-full bg-transparent flex flex-col justify-center items-center gap-y-4 md:gap-y-3">
            {/* Logo & Title display */}
            <div className="w-full flex justify-start md:justify-center lg:justify-start items-center gap-x-2 md:gap-x-3 lg:gap-x-4">
              {/* Logo */}
              <div
                className="w-[34%] md:w-[20%] lg:w-[34%] h-[22.5vh] md:h-[16vh] lg:h-[22.5vh] bg-transparent"
                style={{
                  backgroundImage: `url(/images/logo.png)`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              {/* Title */}
              <div className="font-bold text-4xl md:text-3xl lg:text-4xl text-yellow-400/80">
                Nivēśa
              </div>
            </div>
            {/* Description */}
            <div className="text-sm md:text-sm lg:text-sm px-4 md:px-6 lg:px-4 text-gray-400/80 md:text-center lg:text-left">
              Manage your finances smarter with Nivēśa an AI-powered expense
              tracker that delivers personalized financial insights and helps
              you navigate your daily spending with ease and confidence.
            </div>
            {/* Social Section */}
            <div className="w-full gap-x-2 flex justify-start md:justify-center lg:justify-start items-center p-2">
              {/* Facebook */}
              <div className="w-[7.5vh] h-[7.5vh] md:w-[6vh] md:h-[6vh] lg:w-[7.5vh] lg:h-[7.5vh] rounded-full bg-gray-400/30 border border-gray-800 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80">
                <FaFacebookF className="font-bold text-2xl md:text-lg lg:text-2xl text-white" />
              </div>
              {/* X */}
              <div className="w-[7.5vh] h-[7.5vh] md:w-[6vh] md:h-[6vh] lg:w-[7.5vh] lg:h-[7.5vh] rounded-full bg-gray-400/30 border border-gray-800 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80">
                <FaXTwitter className="font-bold text-2xl md:text-lg lg:text-2xl text-white" />
              </div>
              {/* LinkedIn */}
              <div className="w-[7.5vh] h-[7.5vh] md:w-[6vh] md:h-[6vh] lg:w-[7.5vh] lg:h-[7.5vh] rounded-full bg-gray-400/30 border border-gray-800 flex justify-center items-center hover:cursor-pointer hover:bg-yellow-400/80">
                <FaLinkedinIn className="font-bold text-2xl md:text-lg lg:text-2xl text-white" />
              </div>
            </div>
          </div>
          {/* Product, Company, Legal - Full width row on md */}
          <div className="md:col-span-1 lg:col-span-3 w-full bg-transparent flex flex-col md:flex-row justify-center items-start md:items-start gap-y-6 md:gap-y-0 md:gap-x-12 lg:gap-x-2">
            {/* Product */}
            <div className="flex-1 bg-transparent flex flex-col justify-start md:justify-center lg:items-start items-start md:items-center p-4 md:p-2 gap-y-4 md:gap-y-3 lg:gap-y-4">
              <div className="text-xl md:text-lg lg:text-xl font-bold text-white mb-2 md:mb-1 lg:mb-2">
                Product
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Features
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                How it Works
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Pricing
              </div>
            </div>
            {/* Company */}
            <div className="flex-1 bg-transparent flex flex-col justify-start md:justify-center items-start md:items-center lg:items-start p-4 md:p-2 gap-y-4 md:gap-y-3 lg:gap-y-4">
              <div className="text-xl md:text-lg lg:text-xl font-bold text-white mb-2 md:mb-1 lg:mb-2">
                Company
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                About Us
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Blog
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Contact
              </div>
            </div>
            {/* Legal */}
            <div className="flex-1 bg-transparent flex flex-col justify-start md:justify-center items-start md:items-center lg:items-start p-4 md:p-2 gap-y-4 md:gap-y-3 lg:gap-y-4">
              <div className="text-xl md:text-lg lg:text-xl font-bold text-white mb-2 md:mb-1 lg:mb-2">
                Legal
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Privacy Policy
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Cookie Policy
              </div>
              <div className="text-md md:text-sm lg:text-md text-gray-400/80 hover:cursor-pointer hover:text-yellow-400/80">
                Terms of Service
              </div>
            </div>
          </div>
        </div>
        {/* Copyright and Logos Div */}
        <div className="w-full mt-2 md:h-[30%] lg:h-[25%] bg-transparent p-2 md:p-3 flex flex-col justify-start items-center md:flex-row md:justify-between md:items-center lg:flex-row lg:justify-around lg:items-center border-0 md:border-0 lg:border-t-2 lg:border-gray-700">
          <div className="text-sm md:text-xs lg:text-sm text-gray-400/80 text-center md:text-left mb-2 md:mb-0">
            © 2025 Shubham Kadariya. All rights reserved.
          </div>
          <div
            className="w-[25%] md:w-[15%] lg:w-[9.25%] h-[10.5vh] md:h-[7vh] lg:h-[10.5vh] bg-transparent"
            style={{
              backgroundImage: `url('/images/initials.png')`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
