import { getTokenFromStorage } from "../auth/token-service";
import { Account } from "../account/dto/account-dto";
import { User } from "./dto/user-dto";

const SERVER_USER_URL = process.env.SERVER_USER_URL || "http://localhost:3535";

export const getUserById = async (): Promise<{
  success: boolean;
  user: User;
  account: Account;
  response: {
    success: boolean;
    message?: string;
    error?: string;
  };
  message?: string,
  error?: string
}> => {
  const resposne = await fetch(`${SERVER_USER_URL}/user/by`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${getTokenFromStorage()}`,
    },
  });

  const data = await resposne.json();
  return data;
};
