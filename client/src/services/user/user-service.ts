import { getTokenFromStorage } from "../auth/token-service";
import { Account } from "../account/dto/account-dto";
import { EditUser, User } from "./dto/user-dto";

const SERVER_USER_URL = process.env.SERVER_USER_URL || "http://localhost:3535";


// Get User By ID
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
    credentials: "include",
  });

  const data = await resposne.json();
  return data;
};


// Edit User's Personal Informations
export const edit_user = async (body: EditUser): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/user/my-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${getTokenFromStorage()}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
}