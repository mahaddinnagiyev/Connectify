import { getToken } from "../auth/token-service";
import { BlockAction, BlockListDTO } from "./dto/block-list-dto";

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
