import axios from "axios";

const getBudgetInfo = async (id: string) => {
  return axios.get(`http://localhost:3001/api/v1/budget/${id}`, {
    withCredentials: true,
  });
};

export { getBudgetInfo };
