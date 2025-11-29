import axios from "axios";

type createAccountData = {
  name: string;
  type: "CURRENT" | "SAVINGS";
  balance?: number;
  isDefault?: boolean;
  userId: string;
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

export { createNewAccount };
