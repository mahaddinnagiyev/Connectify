import { ConfirmAccountDTO } from "./dto/confirm-account-dto";
import { LoginDTO } from "./dto/login-dto";
import { SignupDTO } from "./dto/singup-dto";

const SERVER_USER_URL = "http://localhost:3535";

// Signup
export const signup = async (
  user: SignupDTO
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
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

// Confirm Accont Via Email
export const confirm_account = async (
  code: ConfirmAccountDTO
): Promise<{
  response: { success: boolean; error?: string; message?: string };
  success?: boolean;
  message?: string;
  error?: string;
}> => {
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

// Login
export const login = async (
  user: LoginDTO
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const resposne = await fetch(`${SERVER_USER_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
    credentials: "include",
  });

  const data = await resposne.json();
  return data;
};
