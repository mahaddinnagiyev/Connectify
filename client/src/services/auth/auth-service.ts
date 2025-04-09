import { ConfirmAccountDTO } from "./dto/confirm-account-dto";
import { LoginDTO } from "./dto/login-dto";
import { SignupDTO } from "./dto/singup-dto";
import { getToken } from "./token-service";

const SERVER_USER_URL = process.env.SERVER_USER_URL || "http://localhost:3636";

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

// Logout
export const logout = async (): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  const data = response.json();
  return data;
};

// Forgot Password
export const forgot_password = async (
  email: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  return data;
};

// Check is Reset Token valid
export const isResetTokenValid = async (
  token: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/check?token=${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
};

// Reset Password
export const resetPassword = async (
  password: string,
  token: string
): Promise<{
  success: boolean;
  message?: string;
  error: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${SERVER_USER_URL}/auth/reset-password?token=${token}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      credentials: "include",
      body: JSON.stringify({ password }),
    }
  );
  const data = await response.json();
  return data;
};

// Delete Account
export const delete_account = async (): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
    credentials: "include",
  });

  const data = await response.json();
  return data;
};

// Confirm Delete Account
export const confirm_delete_account = async (
  token: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${SERVER_USER_URL}/auth/delete/confirm?token=${token}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
};

// Login With Face ID
export const login_with_face_id = async (body: {
  username_or_email_face_id: string;
  face_descriptor: number[];
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/login/faceid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data;
};

// Register Face ID
export const register_user_face_id = async (
  face_descriptor: number[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/register/faceid`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
    credentials: "include",
    body: JSON.stringify({ face_descriptor }),
  });

  const data = await response.json();
  return data;
};

// Remove Face ID
export const remove_user_face_id = async (): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${SERVER_USER_URL}/auth/remove/faceid`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${await getToken()}`,
    },
    credentials: "include",
  });

  const data = await response.json();
  return data;
};
