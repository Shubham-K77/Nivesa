export type FamilyMember = {
  id: string;
  name: string;
};

export type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  transactions: [];
  familyMembers: FamilyMember[];
};
