import axios from "axios";
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

const signup = async ({
  email,
  name,
  phoneNumber,
  password,
}: signupCredentials) => {
  return await axios.post("http://localhost:3001/api/v1/users", {
    email,
    name,
    phoneNumber,
    password,
  });
};

const login = async ({ email, password }: loginCredentials) => {
  return await axios.post(
    "http://localhost:3001/api/v1/users/login",
    {
      email,
      password,
    },
    { withCredentials: true }
  );
};

const verify = async ({ otp, token }: otpCredential) => {
  return await axios.post(
    `http://localhost:3001/api/v1/users/verify/${token}`,
    { otp }
  );
};

const resendOtp = async ({ token }: { token: string }) => {
  return await axios.post(
    `http://localhost:3001/api/v1/users/resend/${token}`,
    {}
  );
};

export { signup, login, verify, resendOtp };
