/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";
import FamilyMemberForm from "./FamilyMemberForm";
import { IoPersonAddOutline } from "react-icons/io5";

export interface FamilyMember {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
  invitationToken?: string;
  invitationExpiry?: Date;
  isActive?: boolean;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
}

const FamilyMembersList = ({ members, setMembers }: FamilyMembersListProps) => {
  //Update a member's data
  const handleMemberChange = (id: number, field: any, value: any) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };
  //Add new member's data
  const addMember = () => {
    setMembers([...members, { id: Date.now(), name: "", phoneNumber: "" }]);
  };
  //Remove existing member's data
  const removeMember = (id: any) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };
  return (
    <div className="p-2 border border-gray-700/50 rounded-2xl">
      {members.map((member) => (
        <FamilyMemberForm
          key={member.id}
          member={member}
          onChange={handleMemberChange}
          onRemove={removeMember}
        />
      ))}
      <div className="p-1 w-full grid grid-cols-1">
        <button
          type="button"
          onClick={addMember}
          className="w-full py-3 bg-linear-to-br from-blue-800/20 to-teal-600/50 border border-blue-400/10 transition-all ease-in-out duration-150 hover:scale-95 hover:cursor-pointer rounded-lg flex justify-center items-center gap-x-4"
        >
          <IoPersonAddOutline className="text-white" size={22} />
          <div className="text-white font-semibold">New Family Member</div>
        </button>
      </div>
    </div>
  );
};

export default FamilyMembersList;
