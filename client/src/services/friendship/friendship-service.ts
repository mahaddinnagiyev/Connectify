import { getToken } from "../auth/token-service";
import { FriendshipRecieveRequestDTO, FriendshipSentRequestDTO, UserFriendsDTO } from "./dto/friendship-dto";

export const getFriends = async (): Promise<{
  success: boolean;
  friends: UserFriendsDTO[];
  response: { success: boolean; error?: string; message?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/my-friends`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );

  const data = response.json();
  return data;
};

export const getFriendRequests = async (): Promise<{
  success: boolean;
  sentRequests: FriendshipSentRequestDTO[];
  receivedRequests: FriendshipRecieveRequestDTO[];
  message?: string;
  error?: string;
  response: { success: boolean; error?: string; message?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
    }
  );

  const data = response.json();
  return data;
};
