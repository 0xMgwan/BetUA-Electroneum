import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the backend WebSocket server
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current!;
};
