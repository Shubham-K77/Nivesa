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
    { withCredentials: true }
  );
};

export { getBudgetInfo, createBudget };
