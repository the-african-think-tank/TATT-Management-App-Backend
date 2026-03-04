import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000/messages';

let socket: Socket | null = null;

export const initiateSocket = (token: string) => {
    socket = io(SOCKET_URL, {
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
