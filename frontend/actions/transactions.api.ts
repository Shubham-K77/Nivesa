import { Transaction, UpdateTransaction } from "@/types/transaction.type";
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
const getSpecificTransactionInfo = async (transactionId: string) => {
  return axios.get(
    `http://localhost:3001/api/v1/transactions/${transactionId}`,
    { withCredentials: true },
  );
};
const updateSpecificTransaction = async (
  transactionId: string,
  transactionData: UpdateTransaction,
) => {
  return axios.patch(
    `http://localhost:3001/api/v1/transactions/${transactionId}`,
    transactionData,
    { withCredentials: true },
  );
};
export {
  deleteBulkTransactions,
  createTransaction,
  scanRecepitImage,
  getSpecificTransactionInfo,
  updateSpecificTransaction,
};
