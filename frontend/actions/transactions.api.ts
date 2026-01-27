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
  return axios.post("http://localhost:3001/api/v1/transactions", data, {
    withCredentials: true,
  });
};
const scanRecepitImage = async (file: File) => {
  const formData = new FormData();
  formData.append("receipt", file);
  return axios.post(
    "http://localhost:3001/api/v1/transactions/scan",
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export { deleteBulkTransactions, createTransaction, scanRecepitImage };
