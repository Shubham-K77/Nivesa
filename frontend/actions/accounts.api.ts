import axios from "axios";

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
};

type createFamilyAccountData = {
  userId: string;
  name: string;
  type: "CURRENT" | "SAVINGS" | "FAMILY";
  balance?: number;
  isDefault?: boolean;
  familyMemberInfo: createNewFamilyMemberData[];
};

const createNewAccount = async (data: createAccountData) => {
  const result = await axios.post(
    "http://localhost:3001/api/v1/accounts",
    data,
    {
      withCredentials: true,
    }
  );
  return result;
};

const getAccountsInfo = async (userId: string) => {
  return axios.get(`http://localhost:3001/api/v1/accounts/${userId}`, {
    withCredentials: true,
  });
};

const createNewFamilyAccount = async (data: createFamilyAccountData) => {
  return axios.post("http://localhost:3001/api/v1/accounts/family", data, {
    withCredentials: true,
  });
};

export { createNewAccount, getAccountsInfo, createNewFamilyAccount };
