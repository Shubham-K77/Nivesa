"use client";
//Type:
import { Account } from "@/types/account.type";
//Hooks:
import { useRouter } from "next/navigation";
//Icons:
import { FaRegUser } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineSavings } from "react-icons/md";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateDefaultFlag } from "@/actions/accounts.api";
const AccountInfoCard = ({
  accountInfo,
  onDefaultChanged,
}: {
  accountInfo: Account;
  onDefaultChanged?: () => void;
}) => {
  const router = useRouter();
  const handleDefaultChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (accountInfo.isDefault) {
        return toast.warning("This account is already set as your default.");
      }
      const response = await updateDefaultFlag({
        userId: accountInfo.userId,
        accountId: accountInfo.id,
      });
      toast.success(response.data.message);
      return onDefaultChanged?.();
    } catch (error: any) {
      return toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div
      className={`w-full rounded-xl bg-linear-to-br flex flex-col justify-start items-center gap-y-6 transition-all ease-in-out duration-150 ${
        accountInfo.type === "FAMILY"
          ? "from-emerald-500/10 to-teal-500/10 shadow-teal-500/30 border-teal-500/30"
          : accountInfo.type === "CURRENT"
          ? "from-blue-500/10 to-cyan-500/10 shadow-cyan-500/30 border-cyan-500/30"
          : "from-amber-500/10 to-orange-500/10 shadow-orange-500/30 border-orange-500/30"
      } hover:cursor-pointer hover:shadow-md hover:border hover:scale-95`}
      onClick={() => router.push(`/account/${accountInfo.id}`)}
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
          className="data-[state=unchecked]:bg-gray-700 data-[state=checked]:bg-amber-400 hover:cursor-pointer"
          checked={accountInfo.isDefault}
          onClick={(e) => handleDefaultChange(e)}
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
      <div className="w-full flex justify-center items-center mb-4 gap-x-4">
        {/* Created At */}
        <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
          Created at:{" "}
          {accountInfo?.createdAt &&
            new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }).format(new Date(accountInfo.createdAt))}
        </div>
        {/* Family Members Info */}
        {accountInfo.type === "FAMILY" ? (
          <div className="flex -space-x-3">
            {accountInfo.familyMembers.map((member) => (
              <div
                key={member?.id}
                className="w-[4.5vh] h-[4.5vh] rounded-full bg-linear-to-br from-emerald-300/80 to-green-600/80 flex justify-center items-center"
              >
                <div className="text-white text-md md:text-lg lg:text-sm">
                  {member?.name
                    .split(" ")
                    .map((word: string) => word[0])
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
