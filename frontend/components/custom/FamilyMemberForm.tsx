/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";

const FamilyMemberForm = ({ member, onChange, onRemove }: any) => {
  return (
    <div className="w-full bg-transparent flex flex-col justify-start items-center rounded-lg p-4 mb-2">
      <div className="w-[98%] space-y-4 flex flex-col justify-start items-center">
        {/* Name Field */}
        <div className="w-full flex flex-col space-y-2 justify-start items-start">
          <label className="font-normal text-sm md:text-lg lg:text-sm text-white">
            Member Name
          </label>
          <Input
            placeholder="e.g., John Doe"
            type="text"
            className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
            value={member.name}
            onChange={(e) => onChange(member.id, "name", e.target.value)}
          />
        </div>
        {/* Email Field */}
        <div className="w-full flex flex-col space-y-2 justify-start items-start">
          <label className="font-normal text-sm md:text-lg lg:text-sm text-white">
            Member Email (Optional)
          </label>
          <Input
            placeholder="e.g., john.doe@gmail.com"
            type="text"
            className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
            value={member.email}
            onChange={(e) => onChange(member.id, "email", e.target.value)}
          />
        </div>
        {/* Phone Number Field */}
        <div className="w-full flex flex-col space-y-2 justify-start items-start">
          <label className="font-normal text-sm md:text-lg lg:text-sm text-white">
            Member Phone (Optional)
          </label>
          <Input
            placeholder="e.g., +9779860478942"
            type="text"
            className="bg-gray-700/40 backdrop-blur-md p-2 rounded-lg border border-gray-700/80 w-full h-[7vh] md:h-[5.75vh] lg:h-[7vh] flex justify-center items-center font-semibold text-white"
            value={member.phoneNumber}
            onChange={(e) => onChange(member.id, "phoneNumber", e.target.value)}
          />
        </div>
        {/* Remove Button */}
        <div className="w-full grid grid-cols-1 p-2">
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="w-full py-4 bg-linear-to-br from-red-800/20 to-rose-600/50 border border-red-400/10 transition-all ease-in-out duration-150 hover:scale-95 hover:cursor-pointer text-white font-semibold rounded-lg"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberForm;
