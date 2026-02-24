//Imports
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const setFamilyMemberPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  return await axios.post(`${API_URL}/api/v1/familymember`, {
    token,
    newPassword,
  });
};

export { setFamilyMemberPassword };
