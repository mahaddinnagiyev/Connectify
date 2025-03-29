import { io } from "socket.io-client";
import { getToken } from "../auth/token-service";

export const createSocket = async () => {
  const token = await getToken();

  if (!token) return;

  return io(`${process.env.VITE_SERVER_WEBSOCKET_URL}`, {
    transports: ["websocket"],
    auth: { token },
  });
}


export const uploadImage = async (
  formData: FormData,
  roomId: string,
  senderId: string
) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/messenger/upload-image?roomId=${roomId}&senderId=${senderId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};

export const uploadVideo = async (
  formData: FormData,
  roomId: string,
  senderId: string
) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/messenger/upload-video?roomId=${roomId}&senderId=${senderId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};

export const uploadFile = async (
  formData: FormData,
  roomId: string,
  senderId: string
) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/messenger/upload-file?roomId=${roomId}&senderId=${senderId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};

export const uploadAudio = async (
  formData: FormData,
  roomId: string,
  senderId: string
) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/messenger/upload-audio?roomId=${roomId}&senderId=${senderId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
      credentials: "include",
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};

export const getMessagesForRoom = async (roomId: string) => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/messenger/chat-rooms/${roomId}/messages`,
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
