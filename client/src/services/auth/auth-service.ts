import { ConfirmAccountDTO } from "./dto/confirm-account-dto";
import { SignupDTO } from "./dto/singup-dto";

const SERVER_USER_URL = "http://localhost:3535";

export const signup = async (user: SignupDTO): Promise<{ success?: boolean, message?: string, error?: string, response: { success: boolean, message?: string, error?: string } }> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
    credentials: "include",
  });

  const data = await response.json();
  return data;
};

export const confirm_account = async (code: ConfirmAccountDTO ): Promise<{ response: { success: boolean,  error?: string, message?: string}, success?: boolean, message?: string, error?: string }> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/signup/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ code: Number(code.code) }),
    credentials: "include",
  });

  const data = await response.json();
  return data;
};
