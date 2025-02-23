import { io, Socket } from "socket.io-client";
import { getToken } from "../auth/token-service";

let socket: Socket | null = null; // `socket` dəyişənini `Socket` tipi ilə təyin edirik

export async function createSocket() {
  const token = await getToken();
  socket = io("ws://localhost:3636", {
    auth: { token },
  });
}

createSocket(); // `socket` obyektini yaratmaq üçün çağırırıq

export { socket };
