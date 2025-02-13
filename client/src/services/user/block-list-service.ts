import { getToken } from "../auth/token-service";
import { BlockListDTO } from "./dto/block-list-dto";

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
