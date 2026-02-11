import axios from "axios";

const getBudgetInfo = async (id: string) => {
  return axios.get(`http://localhost:3001/api/v1/budget/${id}`, {
    withCredentials: true,
  });
};
const createBudget = async ({
  accountId,
  amount,
}: {
  accountId: string;
  amount: number;
}) => {
  return axios.patch(
    `http://localhost:3001/api/v1/budget/${accountId}`,
    { amount },
    { withCredentials: true },
  );
};

// Family Budget APIs
const getFamilyMembersByAccount = async (accountId: string) => {
  return axios.get(
    `http://localhost:3001/api/v1/budget/family/members/${accountId}`,
    {
      withCredentials: true,
    },
  );
};

const getFamilyBudgetInfo = async (familyMemberId: string) => {
  return axios.get(
    `http://localhost:3001/api/v1/budget/family/${familyMemberId}`,
    {
      withCredentials: true,
    },
  );
};

const createUpdateFamilyBudget = async ({
  familyMemberId,
  amount,
}: {
  familyMemberId: string;
  amount: number;
}) => {
  return axios.patch(
    `http://localhost:3001/api/v1/budget/family/${familyMemberId}`,
    { amount },
    { withCredentials: true },
  );
};

export {
  getBudgetInfo,
  createBudget,
  getFamilyMembersByAccount,
  getFamilyBudgetInfo,
  createUpdateFamilyBudget,
};
