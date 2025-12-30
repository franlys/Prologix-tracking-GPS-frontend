import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PositionUpdate {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  altitude: number;
  timestamp: string;
  address?: string;
  batteryLevel?: number;
  satellites?: number;
  ignition?: boolean;
  motion?: boolean;
}

interface DeviceStatus {
  deviceId: string;
  status: 'online' | 'offline';
  timestamp: string;
}

interface EventNotification {
  type: string;
  deviceId: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface UsePositionUpdatesReturn {
  isConnected: boolean;
  lastPosition: PositionUpdate | null;
  subscribeToDevice: (deviceId: string) => void;
  unsubscribeFromDevice: (deviceId: string) => void;
  onPositionUpdate: (callback: (position: PositionUpdate) => void) => () => void;
  onDeviceStatus: (callback: (status: DeviceStatus) => void) => () => void;
  onEvent: (callback: (event: EventNotification) => void) => () => void;
}

const WEBSOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export function usePositionUpdates(): UsePositionUpdatesReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastPosition, setLastPosition] = useState<PositionUpdate | null>(null);

  const positionCallbacksRef = useRef<Set<(position: PositionUpdate) => void>>(
    new Set()
  );
  const statusCallbacksRef = useRef<Set<(status: DeviceStatus) => void>>(
    new Set()
  );
  const eventCallbacksRef = useRef<Set<(event: EventNotification) => void>>(
    new Set()
  );

  useEffect(() => {
    let socket: Socket | null = null;

    const initSocket = async () => {
      try {
        // Get auth token
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
          console.warn('No auth token found, skipping WebSocket connection');
          return;
        }

        // Create socket connection
        socket = io(`${WEBSOCKET_URL}/positions`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
        });

        socket.on('disconnect', () => {
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
        });

        socket.on('connected', (data) => {
          console.log('📡 WebSocket ready:', data.message);
        });

        socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error.message);
          setIsConnected(false);
        });

        // Position updates
        socket.on('position:update', (position: PositionUpdate) => {
          setLastPosition(position);

          // Notify all registered callbacks
          positionCallbacksRef.current.forEach((callback) => {
            callback(position);
          });
        });

        // Batch position updates
        socket.on('positions:batch', (positions: PositionUpdate[]) => {
          if (positions.length > 0) {
            const latest = positions[positions.length - 1];
            setLastPosition(latest);

            positions.forEach((position) => {
              positionCallbacksRef.current.forEach((callback) => {
                callback(position);
              });
            });
          }
        });

        // Device status updates
        socket.on('device:status', (status: DeviceStatus) => {
          statusCallbacksRef.current.forEach((callback) => {
            callback(status);
          });
        });

        // Event notifications
        socket.on('event:notification', (event: EventNotification) => {
          eventCallbacksRef.current.forEach((callback) => {
            callback(event);
          });
        });

        // Subscribe confirmation
        socket.on('subscribed', (data) => {
          console.log(`✅ Subscribed to device ${data.deviceId}`);
        });
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('🔌 Closing WebSocket connection');
        socket.disconnect();
      }
    };
  }, []);

  const subscribeToDevice = useCallback((deviceId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:device', { deviceId });
    }
  }, []);

  const unsubscribeFromDevice = useCallback((deviceId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe:device', { deviceId });
    }
  }, []);

  const onPositionUpdate = useCallback(
    (callback: (position: PositionUpdate) => void) => {
      positionCallbacksRef.current.add(callback);

      // Return unsubscribe function
      return () => {
        positionCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  const onDeviceStatus = useCallback(
    (callback: (status: DeviceStatus) => void) => {
      statusCallbacksRef.current.add(callback);

      return () => {
        statusCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  const onEvent = useCallback(
    (callback: (event: EventNotification) => void) => {
      eventCallbacksRef.current.add(callback);

      return () => {
        eventCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  return {
    isConnected,
    lastPosition,
    subscribeToDevice,
    unsubscribeFromDevice,
    onPositionUpdate,
    onDeviceStatus,
    onEvent,
  };
}
