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
    <div className="bg-linear-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/40 backdrop-blur-md transition-all duration-500 hover:transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/25 hover:shadow-2xl h-[45vh] md:h-[35vh] lg:h-[45vh] rounded-2xl flex flex-col justify-center items-center gap-y-8 hover:cursor-pointer">
      {/* Border Glow */}
      <div className="absolute inset-0 rounded-xl border border-green-500/0 group-hover:border-yellow-500/20 transition-all duration-500"></div>
      {/* Motif Display */}
      <div className="w-[24.5%] md:w-[30.5%] lg:w-[18.75%] h-[10.75vh] md:h-[8.5vh] lg:h-[10.75vh] bg-linear-to-r from-yellow-400/80 to-amber-600/80 rounded-xl flex justify-center items-center">
        <div className="w-[85%] h-[8.5vh] md:h-[6.5vh] lg:h-[8.5vh] bg-linear-to-r from-yellow-400/40 to-amber-600/40 rounded-xl flex justify-center items-center">
          {icon == 1 ? (
            <LuBrain className="text-4xl lg:text-3xl font-bold text-white" />
          ) : icon == 2 ? (
            <AiOutlineStock className="text-4xl lg:text-3xl font-bold text-white" />
          ) : icon == 3 ? (
            <BiSolidMessageRoundedError className="text-4xl lg:text-3xl font-bold text-white" />
          ) : icon == 4 ? (
            <FaReceipt className="text-4xl lg:text-3xl font-bold text-white" />
          ) : icon == 5 ? (
            <MdDashboardCustomize className="text-4xl lg:text-3xl font-bold text-white" />
          ) : (
            <IoLogoWhatsapp className="text-4xl lg:text-3xl font-bold text-white" />
          )}
        </div>
      </div>
      {/* Title */}
      <div className="text-xl font-semibold text-white">{title}</div>
      {/* Description */}
      <div className="w-[95%] lg:w-[85%] p-2 text-md lg:text-sm text-gray-400/80">
        {desc}
      </div>
    </div>
  );
};

export default DisplayCard;
