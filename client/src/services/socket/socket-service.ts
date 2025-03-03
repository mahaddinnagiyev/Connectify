import { io, Socket } from "socket.io-client";
import { getToken } from "../auth/token-service";

let socket: Socket | null = null;

export async function createSocket() {
  const token = await getToken();

  if (!token) return (window.location.href = "/auth/login");

  socket = io("ws://localhost:3636", {
    auth: { token },
  });
}

createSocket();

export { socket };

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
