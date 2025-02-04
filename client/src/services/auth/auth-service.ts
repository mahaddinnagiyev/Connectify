import { SignupDTO } from "./dto/singup-dto";

const SERVER_USER_URL = "http://localhost:3535";

export const signup = async (user: SignupDTO): Promise<{ success?: boolean, message?: string, error?: string, response: { success: boolean, message?: string, error?: string } }> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();
  return data;
};

export const confirm_accpount = async (confirm_code: number) => {
  const response = await fetch(`${SERVER_USER_URL}/auth/signup/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(confirm_code),
  });

  const data = await response.json();
  return data;
};
