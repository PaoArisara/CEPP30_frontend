// src/hooks/useParkingHistory.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ParkingLogItem,
  HistoryResponse,
  ParkingLogResponse,
} from '../types/Log';
import { WebSocketResponse } from '../types/Common';
import { ProcessedFilters, SearchFields } from '../types/Search';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/ApiConfig';
import { useSocketService } from './socket/useSocketService';
import LogSocketService from '../services/LogSocketService';

export const headersConfig = [
  { label: 'ทะเบียนรถ', key: 'license' },
  { label: 'ตำแหน่งจอดรถ', key: 'location' },
  { label: 'วันที่และเวลาเข้า', key: 'timeIn' },
  { label: 'วันที่และเวลาออก', key: 'timeOut' },
];

const initialFilters: ProcessedFilters = {
  page: 1,
  limit: 10,
};

export const useParkingHistory = () => {
  const { token } = useAuth();

  // Socket connection
  const socket = useSocketService(LogSocketService, true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for managing async operations
  const fetchingRef = useRef<boolean>(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRequestIdRef = useRef<number>(0);

  // Main data state
  const [logs, setLogs] = useState<ParkingLogResponse>({
    data: [],
    meta: { total: 0, lastPage: 0, page: 1, limit: 10 }
  });

  // UI States
  const [activeMap, setActiveMap] = useState<string>('AB');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [selectedCar, setSelectedCar] = useState<ParkingLogItem | null>(null);
  const [showCarInfoModal, setShowCarInfoModal] = useState(false);
  const [showCarHistoryModal, setShowCarHistoryModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // History Modal States
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  // Filter States
  const [filters, setFilters] = useState<ProcessedFilters>(initialFilters);

  // Data Fetching with improved error handling and request tracking
  const fetchParkingData = useCallback(async (map: string) => {
    // Prevent concurrent requests
    if (fetchingRef.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    // Clear previous timeout if any
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Check socket connection
    if (!socket?.connected) {
      setError('รอการเชื่อมต่อ...');
      
      // Set timeout for connection attempt
      connectionTimeoutRef.current = setTimeout(() => {
        if (!socket?.connected) {
          setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
          setLoading(false);
        }
      }, 10000); // 10 seconds timeout
      
      return;
    }

    // Show loading indicator only if no data is present
    const hasExistingData = logs.data.length > 0;
    if (!hasExistingData) {
      setLoading(true);
    }

    // Mark fetch operation as in progress
    fetchingRef.current = true;
    
    // Create a unique request ID to track this specific request
    const currentRequestId = ++socketRequestIdRef.current;
    
    try {
      const queryParams = {
        ...filters,
        zone: map !== 'AB' ? map : null,
        timestamp: new Date().toISOString() // Add timestamp to prevent caching
      };

      console.log('Fetching parking logs with params:', queryParams);

      socket.emit('getLogs', queryParams, (response: WebSocketResponse<ParkingLogResponse>) => {
        // Only process the response if it's from the most recent request
        if (currentRequestId !== socketRequestIdRef.current) {
          console.log('Ignoring stale response from request:', currentRequestId);
          return;
        }
        
        console.log('Socket response:', response);
        fetchingRef.current = false; // Mark fetch operation as complete
        
        if (response.success && response.data) {
          const processedResponse = {
            ...response.data,
            meta: {
              ...response.data.meta,
              totalPages: response.data.meta.lastPage // Map fields for consistency
            }
          };
          
          // Validate data structure before updating state
          if (Array.isArray(processedResponse.data)) {
            setLogs(processedResponse);
            setLastRefreshTime(new Date());
            setError(null);
          } else {
            console.error('Invalid data structure:', processedResponse);
            setError('รูปแบบข้อมูลไม่ถูกต้อง');
          }
        } else {
          setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
        }
        
        setLoading(false);
      });
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [socket, filters, logs.data.length]);

  // WebSocket event handlers
  const handleLogUpdate = useCallback((data: any) => {
    console.log('Log update received:', data);

    if (data.success) {
      // Refresh data without changing the loading state
      fetchParkingData(activeMap);
      setLastRefreshTime(new Date());
    }
  }, [fetchParkingData, activeMap]);

  // Socket connection setup
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('🔗 Socket connected successfully');
      setIsConnected(true);
      setError(null);
      
      // Fetch data immediately on successful connection
      fetchParkingData(activeMap);
    };

    const handleDisconnect = () => {
      console.log('⚠️ Socket disconnected');
      setIsConnected(false);
      setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
    };

    // Register event handlers
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('logCreated', handleLogUpdate);
    socket.on('logUpdated', handleLogUpdate);
    socket.on('statsUpdated', handleLogUpdate);

    // Check current connection status
    if (socket.connected) {
      setIsConnected(true);
      setError(null);
    }

    // Cleanup function
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('logCreated', handleLogUpdate);
      socket.off('logUpdated', handleLogUpdate);
      socket.off('statsUpdated', handleLogUpdate);
    };
  }, [socket, handleLogUpdate, activeMap, fetchParkingData]);

  // Refresh on token or connection changes
  useEffect(() => {
    if (token && isConnected) {
      console.log('Authentication or connection status changed, refreshing data');
      fetchParkingData(activeMap);
    }
  }, [token, isConnected, activeMap, fetchParkingData]);

  // Car history fetching function with improved error handling
  const getCarHistory = useCallback(async (
    vehicle_id: string, 
    page: number = 1, 
    limit: number = 10
  ) => {
    console.log('Fetching vehicle history:', { vehicle_id, page, limit });
  
    if (!token) {
      setError('Unauthorized: No token available');
      setHistoryLoading(false);
      return;
    }
  
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/vehicles/${vehicle_id}/history?page=${page}&limit=${limit}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        let errorMessage = 'Failed to fetch vehicle history';
        try {
          // Try to parse error message from response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('History data received:', data);
      
      setHistory(data);
      setHistoryError(null);
    } catch (error) {
      console.error('Vehicle history fetch error:', error);
      setHistoryError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  // State for history errors
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Handle search with validation and empty check
  const handleSearch = useCallback((searchParams: SearchFields) => {
    // Check if there are any valid search parameters
    const hasSearchValues = Object.entries(searchParams).some(([key, value]) => {
      // Skip page and limit in this check
      if (key === 'page' || key === 'limit') return false;
      return value !== undefined && value !== null && value !== '';
    });
    
    // Update search mode state
    setIsSearch(hasSearchValues);
    
    // If no search values and already in non-search mode, don't trigger a search
    if (!hasSearchValues && !isSearch) {
      return;
    }
    
    // Process dates and prepare params
    const processedParams = {
      ...searchParams,
      page: 1, // Reset to first page when searching
      timestamp_in: searchParams.timestamp_in instanceof Date
        ? searchParams.timestamp_in.toISOString()
        : searchParams.timestamp_in,
      timestamp_out: searchParams.timestamp_out instanceof Date
        ? searchParams.timestamp_out.toISOString()
        : searchParams.timestamp_out,
    };
  
    console.log('Search params processed:', processedParams);
    
    // Update filters
    setFilters((prev: any) => ({
      ...prev,
      ...processedParams
    }));
    
    // Schedule data fetch (using setTimeout to allow state update first)
    setTimeout(() => fetchParkingData(activeMap), 0);
  }, [fetchParkingData, activeMap, isSearch]);

  // Clear search with optimization to prevent unnecessary API calls
  const handleClear = useCallback(() => {
    // If already in default state, do nothing
    if (
      !isSearch && 
      filters.page === initialFilters.page && 
      filters.limit === initialFilters.limit &&
      Object.keys(filters).length <= 2
    ) {
      console.log('Already in default state, no need to clear');
      return;
    }
    
    console.log('Clearing search filters');
    
    // Reset search mode
    setIsSearch(false);
    
    // Reset filters to initial state
    setFilters({
      page: 1,
      limit: 10,
    });
    
    // Fetch data with cleared filters
    setTimeout(() => fetchParkingData(activeMap), 0);
  }, [fetchParkingData, activeMap, filters, isSearch]);

  // Handle parking map selection change
  const handleMapChange = useCallback((map: string) => {
    // Do nothing if already on the selected map
    if (map === activeMap) {
      return;
    }
    
    console.log('Changing active map to:', map);
    setActiveMap(map);
    
    // Reset pagination when changing maps
    setFilters(prev => ({ ...prev, page: 1 }));
    
    // Fetch data for the new map
    fetchParkingData(map);
  }, [fetchParkingData, activeMap]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    // Do nothing if already on the requested page
    if (page === filters.page) {
      return;
    }
    
    console.log('Changing to page:', page);
    setLoading(true);
    setFilters(prev => ({ ...prev, page }));
    
    // Fetch data for the new page
    setTimeout(() => fetchParkingData(activeMap), 0);
  }, [fetchParkingData, activeMap, filters.page]);

  // Car selection and modal handling
  const handleCarSelect = useCallback((car: ParkingLogItem, type: 'info' | 'history') => {
    setSelectedCar(car);
    
    if (type === 'info') {
      setShowCarInfoModal(true);
      setShowCarHistoryModal(false);
    } else {
      setShowCarHistoryModal(true);
      setShowCarInfoModal(false);
      getCarHistory(car.vehicle_id);
    }
  }, [getCarHistory]);

  // Close all modals
  const closeModals = useCallback(() => {
    setShowCarInfoModal(false);
    setShowCarHistoryModal(false);
    setSelectedCar(null);
  }, []);

  // Manual refresh function
  const refreshData = useCallback(() => {
    if (isConnected) {
      // Force reload without changing search state
      fetchParkingData(activeMap);
    } else if (socket) {
      // Try to reconnect if disconnected
      setError('กำลังพยายามเชื่อมต่อใหม่...');
      socket.connect();
    }
  }, [isConnected, activeMap, fetchParkingData, socket]);

  // Return hook values and functions
  return {
    // States
    loading,
    isConnected,
    error,
    logs,
    filters,
    activeMap,
    lastRefreshTime,
    selectedCar,
    showCarHistoryModal,
    showCarInfoModal,
    historyLoading,
    historyError,
    history,
    isSearch,

    // Handlers
    handleSearch,
    handlePageChange,
    handleClear,
    handleMapChange,
    handleCarSelect,
    closeModals,
    fetchParkingData,
    getCarHistory,
    refreshData
  };
};