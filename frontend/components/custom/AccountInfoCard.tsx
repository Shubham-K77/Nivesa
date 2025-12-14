//Type:
interface accountDetails {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  createdAt: string;
  familyMembers: [];
}
//Icons:
import { FaRegUser } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineSavings } from "react-icons/md";
import { Switch } from "@/components/ui/switch";

const AccountInfoCard = ({ accountInfo }: { accountInfo: accountDetails }) => {
  return (
    <div
      className={`w-full rounded-xl bg-linear-to-br flex flex-col justify-start items-center gap-y-6 ${
        accountInfo.type === "FAMILY"
          ? "from-emerald-500/10 to-teal-500/10"
          : accountInfo.type === "CURRENT"
          ? "from-blue-500/10 to-cyan-500/10"
          : "from-amber-500/10 to-orange-500/10"
      }`}
    >
      {/* Motif and Title */}
      <div className="w-full pl-8 flex justify-start items-center gap-x-6 mt-4">
        {/* Motif */}
        <div className="w-[7.5vh] h-[7.5vh] bg-black rounded-full flex justify-center items-center">
          {accountInfo.type === "FAMILY" ? (
            <FiUsers className="font-semibold text-emerald-400/80" size={32} />
          ) : accountInfo.type === "CURRENT" ? (
            <FaRegUser className="font-semibold text-sky-400/80" size={32} />
          ) : (
            <MdOutlineSavings
              className="font-semibold text-orange-400/80"
              size={32}
            />
          )}
        </div>
        {/* Name & Type */}
        <div className="flex flex-col justify-start items-start">
          <div className="font-semibold text-white text-xl">
            {accountInfo.name}
          </div>
          <div className="text-gray-400/80 text-md">
            {accountInfo.type[0] + accountInfo.type.slice(1).toLowerCase()}
          </div>
        </div>
      </div>
      {/* Switch */}
      <div className="w-full flex justify-center items-center gap-x-6">
        <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
          Default Payment Account:
        </div>
        <Switch
          className="data-[state=unchecked]:bg-gray-700 data-[state=checked]:bg-amber-400"
          checked={accountInfo.isDefault}
        />
      </div>
      {/* Available Balance */}
      <div className="w-full flex flex-col justify-start items-center gap-y-2">
        <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
          Available Balance
        </div>
        <div className="text-2xl text-white font-semibold">
          NPR {accountInfo.balance}
        </div>
      </div>
      {/* Created At & Members Display */}
      <div className="w-full flex justify-around items-center mb-4">
        {/* Created At */}
        <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
          Created At: {new Date(accountInfo.createdAt).toLocaleDateString()}
        </div>
        {/* Family Members Info */}
        {accountInfo.type === "FAMILY" ? (
          <div className="flex -space-x-3">
            {accountInfo.familyMembers.map((member) => (
              <div
                key={member.id}
                className="w-[4.5vh] h-[4.5vh] rounded-full bg-linear-to-br from-emerald-300/80 to-green-600/80 flex justify-center items-center"
              >
                <div className="text-white text-md md:text-lg lg:text-sm">
                  {member.name
                    .split(" ")
                    .map((word: string[]) => word[0])
                    .join("")}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AccountInfoCard;
