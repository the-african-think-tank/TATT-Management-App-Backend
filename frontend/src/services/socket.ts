import { io, Socket } from "socket.io-client";
import { tokenStore } from "./token-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Strip trailing slash if present to avoid double slashes
const CLEAN_BASE = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || `${CLEAN_BASE}/messages`;

let socket: Socket | null = null;

export const initiateSocket = () => {
    const token = tokenStore.get();
    socket = io(SOCKET_URL, {
        // Attach the in-memory token (not localStorage)
        auth: { token },
        transports: ['websocket'],
    });

    console.log(`Connecting to socket...`);
    return socket;
};

export const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if (socket) socket.disconnect();
};

export const getSocket = () => socket;
