import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";
const socket = io(WS_URL, {
  autoConnect: true,
  transports: ["websocket"],
});

export default socket;
