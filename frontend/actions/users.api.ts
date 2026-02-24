import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
//Interface:
interface signupCredentials {
  email: string;
  name: string;
  phoneNumber?: string;
  password: string;
}
interface loginCredentials {
  email: string;
  password: string;
}
interface otpCredential {
  otp: string;
  token: string;
}
interface updateProfile {
  name: string;
  phoneNumber?: string;
  profilePic?: File | null;
  password?: string;
  newPassword?: string;
}
//Functions To Call Backend Endpoints:
const signup = async ({
  email,
  name,
  phoneNumber,
  password,
}: signupCredentials) => {
  return await axios.post(`${API_URL}/api/v1/users`, {
    email,
    name,
    phoneNumber,
    password,
  });
};
//Login Into System
const login = async ({ email, password }: loginCredentials) => {
  return await axios.post(
    `${API_URL}/api/v1/users/login`,
    {
      email,
      password,
    },
    { withCredentials: true },
  );
};
//Check The Email Validity
const verify = async ({ otp, token }: otpCredential) => {
  return await axios.post(`${API_URL}/api/v1/users/verify/${token}`, { otp });
};
//Resend The Otp For Email Verify
const resendOtp = async ({ token }: { token: string }) => {
  return await axios.post(`${API_URL}/api/v1/users/resend/${token}`, {});
};
//Reset Request Email Verify
const resetEmail = async ({ email }: { email: string }) => {
  return axios.post(`${API_URL}/api/v1/users/reset`, { email });
};
//Reset Request Resend Otp
const resetResendOtp = async ({ token }: { token: string }) => {
  return axios.post(`${API_URL}/api/v1/users/reset/resend/${token}`);
};
//Reset Request Verify Otp
const resetVerifyOtp = async ({ otp, token }: otpCredential) => {
  return await axios.post(`${API_URL}/api/v1/users/reset/verify/${token}`, {
    otp,
  });
};
//Final Resetting Password
const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) => {
  return await axios.post(`${API_URL}/api/v1/users/reset/password/${token}`, {
    newPassword,
  });
};
//Logout From System
const logout = async () => {
  return axios.post(
    `${API_URL}/api/v1/users/logout`,
    {},
    { withCredentials: true },
  );
};
//Get Request To Acess The Current Logged In User:
const getCurrentUser = async () => {
  return axios.get(`${API_URL}/api/v1/users/active`, {
    withCredentials: true,
  });
};
//Update The User Profile
const updateProfile = async (userData: updateProfile) => {
  // Convert File to base64 if present
  let profilePicBase64: string | undefined;
  if (userData.profilePic) {
    profilePicBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(userData.profilePic!);
    });
  }
  // Build request body conditionally
  const requestBody: any = {
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    profilePic: profilePicBase64,
  };
  // Only add password fields if both are provided
  if (userData.password && userData.newPassword) {
    requestBody.password = userData.password;
    requestBody.newPassword = userData.newPassword;
  }
  return await axios.put(`${API_URL}/api/v1/users`, requestBody, {
    withCredentials: true,
  });
};
export {
  signup,
  login,
  verify,
  resendOtp,
  resetEmail,
  resetResendOtp,
  resetVerifyOtp,
  resetPassword,
  getCurrentUser,
  logout,
  updateProfile,
};
