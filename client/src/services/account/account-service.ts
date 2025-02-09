import { getTokenFromStorage } from "../auth/token-service";
import { EditAccountDTO } from "./dto/account-dto";

// Edit Account's Personal Informations
export const edit_account = async (
  body: EditAccountDTO
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(`${process.env.SERVER_USER_URL}/account/my-info`, {
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
};
