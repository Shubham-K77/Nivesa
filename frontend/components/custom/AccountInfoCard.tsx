"use client";
//Type:
import { Account } from "@/types/account.type";
import { FamilyBudget } from "@/types/budget.type";
import { formatNumber } from "@/lib/currency";
//Hooks:
import { useRouter } from "next/navigation";
//Icons:
import { FaRegUser } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { MdOutlineSavings } from "react-icons/md";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { makeAccountDefault } from "@/queries/account/updateAccountDefault.mutation";
import deleteAccountMutation from "@/queries/transaction/deleteAccountMutation";
import { Delete, Eye, Loader2, ToolCase, Trash, X } from "lucide-react";
import { useState } from "react";

interface AccountInfoCardProps {
  accountInfo: Account;
  userRole: "USER" | "FAMILY_MEMBER";
  familyBudget?: FamilyBudget | null;
  remainingBudget?: number | null;
}

const AccountInfoCard = ({
  accountInfo,
  userRole,
  familyBudget,
  remainingBudget,
}: AccountInfoCardProps) => {
  const router = useRouter();
  const updateAccountDefaultMutation = makeAccountDefault();
  const deleteAccountMut = deleteAccountMutation();
  const handleDefaultChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (accountInfo.isDefault) {
      return toast.warning("This account is already set as your default.");
    }
    updateAccountDefaultMutation.mutate(
      { userId: accountInfo.userId, accountId: accountInfo.id },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
        },
        onError: (error: any) => {
          return toast.error(error?.response?.data?.message);
        },
      },
    );
  };
  const [open, setOpen] = useState(false);
  const [dropDownOpen, setDropDownOpen] = useState(false);
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
      <div className="w-full px-4 flex justify-between items-center gap-x-4 mt-4">
        <div className="flex items-center gap-x-4 flex-1 min-w-0">
          {/* Motif */}
          <div className="w-[7.5vh] h-[7.5vh] aspect-square bg-black rounded-full flex justify-center items-center shrink-0">
            {accountInfo.type === "FAMILY" ? (
              <FiUsers
                className="font-semibold text-emerald-400/80"
                size={32}
              />
            ) : accountInfo.type === "CURRENT" ? (
              <FaRegUser className="font-semibold text-sky-400/80" size={28} />
            ) : (
              <MdOutlineSavings
                className="font-semibold text-orange-400/80"
                size={32}
              />
            )}
          </div>
          {/* Name & Type */}
          <div className="flex flex-col justify-start items-start min-w-0 flex-1">
            <div className="font-semibold text-white text-xl line-clamp-1 truncate w-full">
              {accountInfo.name}
            </div>
            <div className="text-gray-400/80 text-md">
              {accountInfo.type[0] + accountInfo.type.slice(1).toLowerCase()}
            </div>
          </div>
        </div>
        {/* CTA Select For Edit, Delete And View */}
        <DropdownMenu open={dropDownOpen} onOpenChange={setDropDownOpen}>
          <DropdownMenuTrigger asChild>
            <div
              className="w-[6vh] h-[6vh] rounded-md bg-white/10 hover:bg-white/15 flex justify-center items-center hover:cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <ToolCase className="w-6 h-6 text-white" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 border border-white/10 text-white bg-[oklch(0.16_0_0)]">
            {/* CTA To Navigate */}
            <DropdownMenuItem className="group border-0">
              <div
                className="w-full flex justify-start items-center p-2 gap-x-4 hover:cursor-pointer"
                onClick={() => router.push(`/account/${accountInfo.id}`)}
              >
                <Eye className="w-6 h-6 text-orange-600" />
                <div className="text-white font-semibold text-md group-hover:text-black">
                  View Details
                </div>
              </div>
            </DropdownMenuItem>
            {/* CTA To Delete - Only for USER role */}
            {userRole === "USER" && (
              <>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  className="border-0 hover:bg-red-500/10"
                  onSelect={(e) => e.preventDefault()}
                >
                  {/* Dialog For Deleting The Account */}
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <div
                        className="w-full flex justify-start items-center p-2 gap-x-4 hover:cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash className="w-6 h-6 text-destructive" />
                        <div className="text-destructive font-semibold text-md">
                          Delete Account
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent
                      className="bg-gray-950 text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DialogHeader>
                        <DialogTitle>
                          Are you sure you want to delete: {accountInfo.name}?
                        </DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </DialogDescription>
                      </DialogHeader>
                      {/* CTA Buttons */}
                      <div className="w-full grid grid-cols-2 gap-x-4">
                        {/* Delete Button */}
                        <div
                          className={`w-full h-[7.5vh] rounded-md bg-red-600/80 flex justify-center items-center gap-x-4 hover:cursor-pointer hover:bg-red-600/90 transition-colors ${deleteAccountMut.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (deleteAccountMut.isPending) return;
                            deleteAccountMut.mutate(accountInfo.id, {
                              onSuccess: (response) => {
                                toast.success(
                                  response.data.message ||
                                    "Account deleted successfully",
                                );
                                setOpen(false);
                                setDropDownOpen(false);
                              },
                              onError: (error: any) => {
                                console.error("Delete error:", error);
                                toast.error(
                                  error?.response?.data?.message ||
                                    "Failed to delete account",
                                );
                              },
                            });
                          }}
                        >
                          {deleteAccountMut.isPending ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : (
                            <Delete className="w-6 h-6 text-white" />
                          )}
                          <div className="text-white">
                            {deleteAccountMut.isPending
                              ? "Deleting..."
                              : "Delete Account"}
                          </div>
                        </div>
                        {/* Cancel Button */}
                        <div
                          className="w-full h-[7.5vh] rounded-md bg-blue-600/80 flex justify-center items-center gap-x-4 hover:cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                          }}
                        >
                          <X className="w-6 h-6 text-white" />
                          <div className="text-white"> Cancel </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Switch */}
      {userRole === "USER" && (
        <div className="w-[85%] flex justify-between items-center gap-x-6 p-2 bg-white/5 rounded-md">
          <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
            Default Payment Account:
          </div>
          <Switch
            className="data-[state=unchecked]:bg-gray-700 data-[state=checked]:bg-amber-400 hover:cursor-pointer"
            checked={accountInfo.isDefault}
            onClick={(e) => handleDefaultChange(e)}
          />
        </div>
      )}
      {/* Available Balance */}
      <div className="w-full flex flex-col justify-start items-center gap-y-2">
        <div className="text-md md:text-lg lg:text-sm text-gray-400/80">
          {userRole === "FAMILY_MEMBER"
            ? remainingBudget != null
              ? "Remaining Budget"
              : "Allocated Budget"
            : "Available Balance"}
        </div>
        <div className="text-2xl text-white font-semibold">
          NPR{" "}
          {userRole === "FAMILY_MEMBER"
            ? remainingBudget != null
              ? formatNumber(remainingBudget)
              : formatNumber(familyBudget?.amount || 0)
            : formatNumber(accountInfo.balance)}
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
