import { io, Socket } from "socket.io-client";
import { tokenStore } from "./token-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CLEAN_BASE = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
const FEED_SOCKET_URL = process.env.NEXT_PUBLIC_FEED_SOCKET_URL || `${CLEAN_BASE}/feed`;

let feedSocket: Socket | null = null;

export const initiateFeedSocket = () => {
    const token = tokenStore.get();
    feedSocket = io(FEED_SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
    });

    console.log(`Connecting to feed socket...`);
    return feedSocket;
};

export const disconnectFeedSocket = () => {
    console.log('Disconnecting feed socket...');
    if (feedSocket) feedSocket.disconnect();
};

export const getFeedSocket = () => feedSocket;
