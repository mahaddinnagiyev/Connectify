import { getToken } from "../auth/token-service";
import { BlockAction, BlockerListDTO, BlockListDTO } from "./dto/block-list-dto";
import { jwtDecode } from "jwt-decode";

export const get_block_list = async (): Promise<{
  success: boolean;
  blockList: BlockListDTO[];
  response: { success: boolean; error?: string; message?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/user/block-list`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
};

export const get_blocker_list = async (): Promise<{
  success: boolean;
  blockerList: BlockerListDTO[];
  response: { success: boolean; error?: string; message?: string };
}> => {
  const token: string | null = await getToken();
  const decodedToken: { id: string } = jwtDecode(token!);
  const id = decodedToken.id;

  const response = await fetch(
    `${process.env.SERVER_USER_URL}/user/block-list?by=${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
};

// Block User
export const block_and_unblock_user = async (
  id: string,
  block_action: BlockAction
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/user/block-list?id=${id}&action=${block_action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  return data;
};
