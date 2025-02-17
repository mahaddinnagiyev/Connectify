import { getToken } from "../auth/token-service";
import {
  FriendshipRecieveRequestDTO,
  FriendshipSentRequestDTO,
  UserFriendsDTO,
} from "./dto/friendship-dto";
import { FriendshipAction } from "./enum/friendship-status.enum";

// Get All User's Friendship Requests
export const getAllFriendshipRequests = async (): Promise<{
  success: boolean;
  friends: UserFriendsDTO[];
  error?: string;
  response: { success: boolean; error?: string; message?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/requests/all`,
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

// Get All Friends(Accepted)
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

  const data = await response.json();
  return data;
};

// Get All Friendship Requests
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

  const data = await response.json();
  return data;
};

// Send Friendship Request
export const sendFriendshipRequest = async (id: string) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/request/create?requestee=${id}`,
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

// Accept And Reject Friendship
export const acceptAndRejectFriendship = async (
  status: FriendshipAction,
  id: string
): Promise<{
  success: string;
  message: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/request?status=${status}&request=${id}`,
    {
      method: "PATCH",
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

// Remove Friendship
export const removeFriendship = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  response: { success: boolean; message?: string; error?: string };
}> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/friendship/request/remove?request=${id}`,
    {
      method: "DELETE",
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
