// src/hooks/useWebSocket.ts

import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
  const connectedRef = useRef(false);

  useEffect(() => {
    const connect = async () => {
      if (!connectedRef.current && !wsService.isConnected()) {
        try {
          await wsService.connect();
          connectedRef.current = true;
        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
        }
      }
    };

    connect();

    return () => {
      // Cleanup on unmount - optionally disconnect
      // wsService.disconnect();
    };
  }, []);

  const send = useCallback((message: any) => {
    wsService.send(message);
  }, []);

  const on = useCallback((event: string, handler: Function) => {
    wsService.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler: Function) => {
    wsService.off(event, handler);
  }, []);

  return { send, on, off, isConnected: wsService.isConnected() };
}
