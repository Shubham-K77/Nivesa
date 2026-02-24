import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type createAccountData = {
  name: string;
  type: "CURRENT" | "SAVINGS" | "FAMILY";
  balance?: number;
  isDefault?: boolean;
  userId: string;
};
type createNewFamilyMemberData = {
  name: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
  invitationToken?: string;
  invitationExpiry?: Date;
  accountId?: string;
  userId?: string;
  isActive?: boolean;
};
type createFamilyAccountData = {
  userId: string;
  name: string;
  type: "CURRENT" | "SAVINGS" | "FAMILY";
  balance?: number;
  isDefault?: boolean;
  familyMemberInfo: createNewFamilyMemberData[];
};
type isDefaultUpdateData = {
  userId: string;
  accountId: string;
};

const createNewAccount = async (data: createAccountData) => {
  const result = await axios.post(`${API_URL}/api/v1/accounts`, data, {
    withCredentials: true,
  });
  return result;
};
const getAccountsInfo = async () => {
  return axios.get(`${API_URL}/api/v1/accounts`, {
    withCredentials: true,
  });
};
const getEveryAccountInfo = async () => {
  return axios.get(`${API_URL}/api/v1/accounts/all`, {
    withCredentials: true,
  });
};
const getSpecificAccountInfo = async (accountId: string) => {
  return axios.get(`${API_URL}/api/v1/accounts/${accountId}`, {
    withCredentials: true,
  });
};
const createNewFamilyAccount = async (data: createFamilyAccountData) => {
  return axios.post(`${API_URL}/api/v1/accounts/family`, data, {
    withCredentials: true,
  });
};
const updateDefaultFlag = async (data: isDefaultUpdateData) => {
  return axios.patch(
    `${API_URL}/api/v1/accounts/${data.accountId}`,
    {},
    { withCredentials: true },
  );
};
const deleteAccount = async (accountId: string) => {
  return axios.delete(`${API_URL}/api/v1/accounts/${accountId}`, {
    withCredentials: true,
  });
};

const getFamilyMemberAccounts = async () => {
  return axios.get(`${API_URL}/api/v1/accounts/family-member/accounts`, {
    withCredentials: true,
  });
};

export {
  createNewAccount,
  getAccountsInfo,
  getEveryAccountInfo,
  getSpecificAccountInfo,
  createNewFamilyAccount,
  updateDefaultFlag,
  deleteAccount,
  getFamilyMemberAccounts,
};
