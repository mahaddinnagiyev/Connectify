import { getTokenFromStorage } from "../auth/token-service";
import {
  EditSocialDTO,
  SocialLink,
  SocialLinkDTO,
} from "./dto/social-link-dto";

// Get Social Link
export const get_social_links = async (
  id: string
): Promise<{
  success: boolean;
  social_link: SocialLink;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/account/social-link/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${getTokenFromStorage()}`,
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
};

// Add new social link
export const add_social_link = async (
  body: SocialLinkDTO
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/account/social-link`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${getTokenFromStorage()}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    }
  );

  const data = await response.json();
  return data;
};

// Edit Social Link
export const edit_social_link = async (
  id: string,
  body: EditSocialDTO
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/account/social-link/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${getTokenFromStorage()}`,
      },
      body: JSON.stringify(body),
      credentials: "include",
    }
  );

  const data = await response.json();
  return data;
};

// Delete Social Link
export const delete_social_link = async (
  id: string
): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/account/social-link/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${getTokenFromStorage()}`,
      },
    }
  );

  const data = response.json();
  return data;
};
