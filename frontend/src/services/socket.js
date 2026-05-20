import { io } from 'socket.io-client';

let socket = null;

export const initSocketConnection = () => {
  if (socket) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const socketUrl = apiUrl.replace('/api', ''); // Point directly to HTTP domain root

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  if (!token) return null;

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[Socket Connected]: Established client session ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket Disconnected]: Client disconnected from real-time server.');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketConnection();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
