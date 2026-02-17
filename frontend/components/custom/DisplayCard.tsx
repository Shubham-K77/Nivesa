//Icons Import:
import { LuBrain } from "react-icons/lu";
import { AiOutlineStock } from "react-icons/ai";
import { BiSolidMessageRoundedError } from "react-icons/bi";
import { FaReceipt } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";

const DisplayCard = ({
  icon,
  title,
  desc,
}: {
  icon: number;
  title: string;
  desc: string;
}) => {
  return (
    <div className="group relative bg-linear-to-br from-gray-800/50 to-gray-900/70 border border-gray-700/30 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-amber-500/20 hover:shadow-xl rounded-2xl p-6 md:p-8 flex flex-col justify-center items-center gap-y-6 hover:border-amber-500/30">
      {/* Icon Container */}
      <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-yellow-400/80 to-amber-500/80 rounded-2xl flex justify-center items-center shadow-lg group-hover:shadow-amber-400/50 transition-shadow duration-300">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex justify-center items-center">
          {icon == 1 ? (
            <LuBrain className="text-4xl md:text-5xl text-white" />
          ) : icon == 2 ? (
            <AiOutlineStock className="text-4xl md:text-5xl text-white" />
          ) : icon == 3 ? (
            <BiSolidMessageRoundedError className="text-4xl md:text-5xl text-white" />
          ) : icon == 4 ? (
            <FaReceipt className="text-4xl md:text-5xl text-white" />
          ) : icon == 5 ? (
            <MdDashboardCustomize className="text-4xl md:text-5xl text-white" />
          ) : (
            <IoLogoWhatsapp className="text-4xl md:text-5xl text-white" />
          )}
        </div>
      </div>
      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold text-white text-center group-hover:text-amber-400 transition-colors duration-300">
        {title}
      </h3>
      {/* Description */}
      <p className="text-sm md:text-base text-gray-400/90 text-center leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

export default DisplayCard;
