import { useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { BaseSocketService } from '../../services/BaseSocketService';
import { useAuth } from '../../context/AuthContext';

/**
 * Custom hook for managing socket connections
 * @param SocketServiceClassOrInstance - Either a class constructor or an instance of BaseSocketService
 * @param autoConnect - Whether to automatically connect the socket
 * @returns The socket instance
 */
export const useSocketService = (
  SocketServiceClassOrInstance: any,
  autoConnect: boolean = true
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10; // เพิ่มจำนวนครั้งในการพยายามเชื่อมต่อใหม่
  const socketServiceRef = useRef<BaseSocketService | null>(null);
  const tokenRef = useRef<string | null>(null);
  const visibilityChangeListenerRef = useRef<((event: Event) => void) | null>(null);

  // Callback เพื่อสร้าง service instance ใหม่เมื่อจำเป็น
  const getOrCreateSocketService = useCallback(() => {
    if (!socketServiceRef.current) {
      try {
        // Check if already an instance of BaseSocketService
        if (SocketServiceClassOrInstance instanceof BaseSocketService) {
          console.log('Using provided socket service instance');
          socketServiceRef.current = SocketServiceClassOrInstance;
        }
        // Check if it's a constructor function
        else if (typeof SocketServiceClassOrInstance === 'function') {
          console.log('Creating new socket service instance from constructor');
          socketServiceRef.current = new SocketServiceClassOrInstance();
        }
        // Check if it's an object with a namespace property (likely already a service instance)
        else if (typeof SocketServiceClassOrInstance === 'object' && SocketServiceClassOrInstance !== null) {
          console.log('Using provided socket service object');
          socketServiceRef.current = SocketServiceClassOrInstance;
        } else {
          console.error('Invalid socket service provided:', SocketServiceClassOrInstance);
          return null;
        }
      } catch (error) {
        console.error('Error creating socket service instance:', error);
        return null;
      }
    }
    return socketServiceRef.current;
  }, [SocketServiceClassOrInstance]);

  // Function to handle connection and reconnection
  const connectSocket = useCallback((forceRefresh = false) => {
    if (!token) {
      console.log('Cannot connect: No token available');
      return null;
    }

    try {
      const socketService = getOrCreateSocketService();
      
      // Make sure socketService is not null before using it
      if (!socketService) {
        console.error('Failed to create socket service');
        return null;
      }

      // Check if token has changed
      if (tokenRef.current !== token) {
        console.log('Token changed, forcing reconnection');
        tokenRef.current = token;
        forceRefresh = true;
      }

      // เชื่อมต่อโดยบังคับให้รีเฟรชหากต้องการ
      const newSocket = socketService.connect({
        debug: process.env.NODE_ENV === 'development',
        forceRefresh: forceRefresh
      });

      // Reset reconnect attempts on successful connection
      newSocket.on('connect', () => {
        console.log('Socket connected successfully, resetting reconnect attempts');
        reconnectAttempts.current = 0;
      });

      return newSocket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      return null;
    }
  }, [token, getOrCreateSocketService]);

  // Function to handle reconnection with backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log(`Max reconnect attempts (${maxReconnectAttempts}) reached`);
      return;
    }

    reconnectAttempts.current += 1;
    const delay = Math.min(5000, Math.pow(1.5, reconnectAttempts.current) * 1000);
    
    console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${Math.round(delay / 1000)}s`);
    
    setTimeout(() => {
      const newSocket = connectSocket(true);
      if (newSocket) {
        setSocket(newSocket);
      }
    }, delay);
  }, [connectSocket, maxReconnectAttempts]);

  // Function to handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, checking connection status');
      
      const socketService = getOrCreateSocketService();
      
      // Check if socketService is not null before calling methods on it
      if (socketService) {
        if (!socketService.isConnected()) {
          console.log('Socket not connected, attempting to reconnect');
          const newSocket = connectSocket(true);
          if (newSocket) {
            setSocket(newSocket);
          } else {
            attemptReconnect();
          }
        } else {
          console.log('Socket is already connected');
        }
      } else {
        console.error('Socket service is null');
        attemptReconnect();
      }
    }
  }, [connectSocket, attemptReconnect, getOrCreateSocketService]);

  // Effect to setup the socket connection
  useEffect(() => {
    // ตรวจสอบว่ามี token
    if (!autoConnect || !token) return;

    // Register visibility change listener
    visibilityChangeListenerRef.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial connection
    const newSocket = connectSocket(false);
    if (newSocket) {
      setSocket(newSocket);

      // Setup error handling
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        attemptReconnect();
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          attemptReconnect();
        }
      });
    }

    // Cleanup function
    return () => {
      if (visibilityChangeListenerRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeListenerRef.current);
        visibilityChangeListenerRef.current = null;
      }

      if (socketServiceRef.current) {
        console.log('Cleaning up socket connection');
        socketServiceRef.current.cleanup();
        socketServiceRef.current = null;
      }
    };
  }, [token, autoConnect, connectSocket, attemptReconnect, handleVisibilityChange]);

  return socket;
};