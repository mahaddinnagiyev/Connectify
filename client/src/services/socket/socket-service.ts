import { io, Socket } from "socket.io-client";
import { getToken } from "../auth/token-service";

let socket: Socket | null = null;

export async function createSocket() {
  const token = await getToken();
  
  if (!token) return window.location.href = "/auth/login";

  socket = io("ws://localhost:3636", {
    auth: { token },
  });
}

createSocket();

export { socket };
