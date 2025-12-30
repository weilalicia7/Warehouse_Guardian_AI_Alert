/**
 * useWebSocket Hook
 * Real-time WebSocket connection for fraud alerts
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  payload?: any;
  company_id?: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: string) => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for WebSocket connection to receive real-time fraud alerts
 */
export const useWebSocket = (
  onMessage?: (message: WebSocketMessage) => void
): UseWebSocketReturn => {
  const { token, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (!token || !user) {
      console.warn('[WebSocket] No token or user - skipping connection');
      return;
    }

    // Don't create duplicate connections
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Connect with JWT token as query parameter
      const wsUrl = `${WS_URL}/ws?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);

        // Clear any pending reconnect
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }

        // Start heartbeat
        const heartbeat = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send('ping');
          }
        }, 30000); // Ping every 30 seconds

        // Store heartbeat interval for cleanup
        (ws.current as any).heartbeat = heartbeat;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Call callback if provided
          if (onMessage) {
            onMessage(message);
          }

          // Handle different message types
          switch (message.type) {
            case 'connection_established':
              console.log('[WebSocket] Connection established:', message.company_id);
              break;

            case 'fraud_alert':
              console.log('[WebSocket] Fraud alert received:', message.payload);
              // Show toast notification for PAID users only
              if (user.subscription_tier === 'paid') {
                toast.error(
                  `🚨 ${message.payload?.title || 'Security Alert'}`,
                  {
                    duration: 6000,
                  }
                );
              }
              break;

            case 'pong':
              // Heartbeat response
              break;

            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setIsConnected(false);
      };

      ws.current.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Clear heartbeat
        if ((ws.current as any)?.heartbeat) {
          clearInterval((ws.current as any).heartbeat);
        }

        // Auto-reconnect after 5 seconds (if not intentional disconnect)
        if (shouldReconnect.current && event.code !== 1000) {
          reconnectTimeout.current = setTimeout(() => {
            console.log('[WebSocket] Reconnecting...');
            connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setIsConnected(false);
    }
  }, [token, user, onMessage]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (ws.current) {
      if ((ws.current as any).heartbeat) {
        clearInterval((ws.current as any).heartbeat);
      }
      ws.current.close(1000, 'Client disconnect');
      ws.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }, []);

  // Auto-connect on mount if authenticated
  useEffect(() => {
    if (token && user) {
      shouldReconnect.current = true;
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [token, user]); // Only reconnect if token/user changes

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};

export default useWebSocket;
