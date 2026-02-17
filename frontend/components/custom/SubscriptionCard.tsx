//Icons Import:
import { TbFreeRights } from "react-icons/tb";
import { AiOutlineCheck } from "react-icons/ai";
import { PiStudentBold } from "react-icons/pi";
import { AiOutlineCrown } from "react-icons/ai";

const SubscriptionCard = ({
  type,
  desc,
  price,
  subprice,
  points,
}: {
  type: string;
  desc: string;
  price: string;
  subprice: string;
  points: string[];
}) => {
  const isPopular = type === "Student";
  return (
    <div className="group relative h-full">
      <div
        className={`relative h-full p-6 md:p-8 rounded-2xl bg-linear-to-br from-gray-800/50 to-gray-900/70 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex flex-col ${
          isPopular
            ? "border-2 border-amber-500/50 hover:border-amber-500 hover:shadow-amber-500/30 hover:shadow-2xl"
            : "border border-gray-700/30 hover:border-gray-600/50 hover:shadow-gray-700/20 hover:shadow-xl"
        }`}
      >
        {/* Header And Desc */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4 gap-3">
            {type === "Free" ? (
              <>
                <TbFreeRights className="text-3xl text-gray-300" />
                <h3 className="text-2xl font-bold text-white">Free</h3>
              </>
            ) : type === "Student" ? (
              <>
                <PiStudentBold className="text-3xl text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Student</h3>
              </>
            ) : (
              <>
                <AiOutlineCrown className="text-3xl text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Pro</h3>
              </>
            )}
          </div>
          <p className="text-gray-400/90 text-sm md:text-base mb-6">{desc}</p>
          <div className="mb-6">
            <div
              className={`text-4xl md:text-5xl font-bold ${
                type === "Student"
                  ? "text-amber-400"
                  : type === "Pro"
                    ? "text-blue-400"
                    : "text-gray-300"
              }`}
            >
              {price}
            </div>
            <div className="text-gray-400 text-sm mt-2">{subprice}</div>
          </div>
        </div>
        {/* Points */}
        <div className="space-y-3 mb-8 grow">
          {points.map((data, index) => (
            <div className="flex items-start gap-3" key={index}>
              <AiOutlineCheck
                className={`text-xl shrink-0 mt-0.5 ${
                  isPopular ? "text-amber-400" : "text-gray-400"
                }`}
              />
              <span className="text-gray-300 text-sm leading-relaxed">
                {data}
              </span>
            </div>
          ))}
        </div>
        {/* CTA BUTTONS   */}
        {type === "Free" ? (
          <button className="w-full border-2 border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 mt-auto">
            Start for Free
          </button>
        ) : type === "Student" ? (
          <button className="w-full bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-amber-400/50">
            Get Student Plan
          </button>
        ) : (
          <button className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-400/50">
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
