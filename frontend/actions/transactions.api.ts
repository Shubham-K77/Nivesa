import { Transaction } from "@/types/transaction.type";
import axios from "axios";

type TransactionsArray = {
  transactions: Array<string>;
};

const deleteBulkTransactions = async (data: TransactionsArray) => {
  return await axios.post(
    "http://localhost:3001/api/v1/transactions/delete",
    data,
    { withCredentials: true },
  );
};

const createTransaction = async (data: Transaction) => {
  return axios.post(
    "http://localhost:3001/api/v1/transactions",
    data,
    { withCredentials: true },
  );
};

export { deleteBulkTransactions, createTransaction };
