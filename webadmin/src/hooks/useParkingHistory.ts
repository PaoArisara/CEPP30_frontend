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

  const socket = useSocketService(LogSocketService, true);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // เพิ่ม ref เพื่อเก็บสถานะการโหลดข้อมูลล่าสุด
  const fetchingRef = useRef<boolean>(false);
  // เพิ่ม timeout ref เพื่อจัดการกับการรอการเชื่อมต่อ
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [logs, setLogs] = useState<ParkingLogResponse>({
    data: [],
    meta: { total: 0, totalPages: 0, page: 1, limit: 10 }
  });

  // UI States
  const [activeMap, setActiveMap] = useState<string>('AB');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [selectedCar, setSelectedCar] = useState<ParkingLogItem | null>(null);
  const [showCarInfoModal, setShowCarInfoModal] = useState(false);
  const [showCarHistoryModal, setShowCarHistoryModal] = useState(false);

  // History Modal States
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  // Filter States
  const [filters, setFilters] = useState<ProcessedFilters>(initialFilters);

  // Data Fetching
  const fetchParkingData = useCallback(async (map: string) => {
    // ตรวจสอบว่ากำลังโหลดข้อมูลอยู่หรือไม่
    if (fetchingRef.current) {
      console.log('ขณะนี้กำลังโหลดข้อมูล กรุณารอสักครู่...');
      return;
    }

    // ล้าง timeout ก่อนหน้าถ้ามี
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (!socket?.connected) {
      setError('รอการเชื่อมต่อ...');
      
      // ตั้ง timeout เพื่อรอการเชื่อมต่อสำเร็จ ถ้าไม่สำเร็จจะแสดงข้อความว่าเชื่อมต่อไม่ได้
      connectionTimeoutRef.current = setTimeout(() => {
        if (!socket?.connected) {
          setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
          setLoading(false);
        }
      }, 10000); // รอ 10 วินาที
      
      return;
    }

    const hasExistingData = logs.data.length > 0;
    if (!hasExistingData) {
      setLoading(true);
    }

    fetchingRef.current = true; // เริ่มโหลดข้อมูล
    
    try {
      const queryParams = {
        ...filters,
        zone: map !== 'AB' ? map : null,
        timestamp: new Date().toISOString() // เพิ่ม timestamp เพื่อป้องกัน cache
      };

      console.log('กำลังโหลดข้อมูล parking logs...', queryParams);

      socket.emit('getLogs', queryParams, (response: WebSocketResponse<ParkingLogResponse>) => {
        fetchingRef.current = false; // สิ้นสุดการโหลดข้อมูล
        
        if (response.success && response.data) {
          setLogs(response.data);
          setLastRefreshTime(new Date());
          setError(null); // สำคัญ: ล้างข้อความ error เมื่อโหลดสำเร็จ
        } else {
          setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setLoading(false);
      fetchingRef.current = false; // สิ้นสุดการโหลดข้อมูลเมื่อเกิด error
    }
  }, [socket, filters, logs.data.length]);

  // WebSocket Event Handlers
  const handleLogUpdate = useCallback((data: any) => {
    console.log('Received log update:', data);

    if (data.success) {
      // รีเฟรชข้อมูลทั้งหมด
      fetchParkingData(activeMap);
      setLastRefreshTime(new Date());
    }
  }, [fetchParkingData, activeMap]);

  // Socket Connection Setup
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('🔗 Socket connected successfully');
      setIsConnected(true);
      setError(null); // สำคัญ: ล้างข้อความ error เมื่อเชื่อมต่อสำเร็จ
      
      // โหลดข้อมูลทันทีเมื่อเชื่อมต่อสำเร็จ
      fetchParkingData(activeMap);
    };

    const handleDisconnect = () => {
      console.log('⚠️ Socket disconnected');
      setIsConnected(false);
      setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('logCreated', handleLogUpdate);
    socket.on('logUpdated', handleLogUpdate);
    socket.on('statsUpdated', handleLogUpdate);

    if (socket.connected) {
      setIsConnected(true);
      setError(null); // สำคัญ: ล้างข้อความ error ถ้า socket เชื่อมต่ออยู่แล้ว
    }

    return () => {
      // ล้าง timeout ก่อนที่จะ unmount component
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

  // ทำการโหลดข้อมูลใหม่อีกครั้งหลังจาก token refresh
  useEffect(() => {
    if (token && isConnected) {
      console.log('Token มีการเปลี่ยนแปลง หรือการเชื่อมต่อเปลี่ยนแปลง โหลดข้อมูลใหม่');
      fetchParkingData(activeMap);
    }
  }, [token, isConnected, activeMap, fetchParkingData]);

  // In useParkingHistory.ts
  const getCarHistory = async (
    vehicle_id: string, 
    page: number = 1, 
    limit: number = 10
  ) => {
    console.log('Fetching history data:', { vehicle_id, token, page, limit });
  
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
        // Try to get error message from response
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch vehicle history');
      }
  
      const data = await response.json();
      console.log('Fetched history data:', data);
      
      setHistory(data);
      setError(null);
    } catch (error) {
      console.error('Fetch vehicle history error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter Handlers
  const handleSearch = useCallback((searchParams: SearchFields) => {
    const processedParams = {
      ...searchParams,
      page: 1,
      timestamp_in: searchParams.timestamp_in instanceof Date
        ? searchParams.timestamp_in.toISOString()
        : searchParams.timestamp_in,
      timestamp_out: searchParams.timestamp_out instanceof Date
        ? searchParams.timestamp_out.toISOString()
        : searchParams.timestamp_out,
    };

    setFilters((prev: any) => ({
      ...prev,
      ...processedParams
    }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
  }, []);

  // Map Change Handler
  const handleMapChange = useCallback((map: string) => {
    setActiveMap(map);
    fetchParkingData(map);
  }, [fetchParkingData]);

  // Pagination Handler
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev: any) => ({ ...prev, page }));
  }, []);

  // Modal Controls
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

  const closeModals = useCallback(() => {
    setShowCarInfoModal(false);
    setShowCarHistoryModal(false);
    setSelectedCar(null);
  }, []);

  // เพิ่มฟังก์ชันสำหรับรีเฟรชข้อมูลแบบ manual
  const refreshData = useCallback(() => {
    if (isConnected) {
      fetchParkingData(activeMap);
    } else {
      // พยายามเชื่อมต่อใหม่อีกครั้งก่อนโหลดข้อมูล
      if (socket) {
        setError('กำลังพยายามเชื่อมต่อใหม่...');
        socket.connect();
      }
    }
  }, [isConnected, activeMap, fetchParkingData, socket]);

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
    history,

    // Handlers
    handleSearch,
    handlePageChange,
    handleClear,
    handleMapChange,
    handleCarSelect,
    closeModals,
    fetchParkingData,
    getCarHistory,
    refreshData // เพิ่มฟังก์ชันใหม่เพื่อรองรับการรีเฟรชข้อมูลด้วยตนเอง
  };
};