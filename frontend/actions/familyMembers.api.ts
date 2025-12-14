//Imports
import axios from "axios";

const setFamilyMemberPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  return await axios.post("http://localhost:3001/api/v1/familymember", {
    token,
    newPassword,
  });
};

export { setFamilyMemberPassword };
