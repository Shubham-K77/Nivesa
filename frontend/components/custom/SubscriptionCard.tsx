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
  return (
    <div className="group relative">
      <div
        className={`relative p-8 rounded-xl bg-linear-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-md transition-all duration-500 hover:transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/10 h-full flex flex-col ${
          type === "Free"
            ? "border border-gray-700/40"
            : type === "Student"
            ? "border-2 border-green-400"
            : "border border-gray-700/40"
        }`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            {type === "Free" ? (
              <>
                <TbFreeRights className="text-2xl mr-2 w-8 h-8 text-gray-300" />
                <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
              </>
            ) : type === "Student" ? (
              <>
                <PiStudentBold className="text-2xl text-green-500 mr-2 w-8 h-8" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Student
                </h3>
              </>
            ) : (
              <>
                <AiOutlineCrown className="text-blue-400 text-xl w-8 h-8" />
                <h3 className="text-xl font-semibold text-white">Pro</h3>
              </>
            )}
          </div>
          <p className="text-gray-400 mb-4">{desc}</p>
          <div className="mb-6">
            <>
              <span className="text-4xl font-bold text-green-400">{price}</span>
              <span className="text-gray-400 ml-2">{subprice}</span>
            </>
          </div>
        </div>

        <div className="space-y-4 mb-8 grow">
          {points.map((data) => (
            <div className="flex items-center gap-3" key={data}>
              <AiOutlineCheck className="text-green-400 text-lg shrink-0" />
              <span className="text-gray-300 text-sm">{data}.</span>
            </div>
          ))}
        </div>

        {type === "Free" ? (
          <button className="w-full border-2 border-white/40 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer mt-auto">
            Start for Free
          </button>
        ) : type === "Student" ? (
          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer shadow-lg mt-auto">
            Get Student Plan
          </button>
        ) : (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:cursor-pointer shadow-lg mt-auto">
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
