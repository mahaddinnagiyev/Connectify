import { getToken } from "../auth/token-service";
import { Account } from "../account/dto/account-dto";
import { EditUser, User, Users } from "./dto/user-dto";
import { PrivacySettingsDTO } from "../account/dto/privacy-settings-dto";

const SERVER_USER_URL = process.env.SERVER_USER_URL || "http://localhost:3535";

// Get All Users
export const getAllUsers = async (): Promise<{
  success: boolean;
  users: Users[];
  message?: string;
  error?: string;
  response: { success: boolean; error?: string; message?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/user/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
    credentials: "include",
  });

  const data = await response.json();
  return data;
};

// Get User By ID
export const getUserById = async (
  id?: string
): Promise<{
  success: boolean;
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO[];
  response: {
    success: boolean;
    message?: string;
    error?: string;
  };
  message?: string;
  error?: string;
}> => {
  const resposne = await fetch(
    `${SERVER_USER_URL}/user/by${id ? `?id=${id}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );

  const data = await resposne.json();
  return data;
};

// Get User By Username
export const getUserByUsername = async (
  username: string
): Promise<{
  success: boolean;
  user: User;
  account: Account;
  privacy_settings: PrivacySettingsDTO[];
  response: {
    success: boolean;
    message?: string;
    error?: string;
  };
  message?: string;
  error?: string;
}> => {
  const resposne = await fetch(
    `${SERVER_USER_URL}/user/by?username=${username}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );

  const data = await resposne.json();
  return data;
};

// Edit User's Personal Informations
export const edit_user = async (
  body: EditUser
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/user/my-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
};
