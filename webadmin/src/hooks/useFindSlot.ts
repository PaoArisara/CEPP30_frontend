import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { ProcessedFilters, SearchFields } from "../types/Search";
import { Slot, SlotStats } from "../types/Slot";
import { WebSocketResponse } from "../types/Common";
import { CarData } from "../types/Active";
import { API_CONFIG } from "../config/ApiConfig";
import { useSocketService } from "./socket/useSocketService";
import ParkingSocketService from "../services/ParkingSocketService";

export const useFindSlot = () => {
    const { token } = useAuth();

    const socket = useSocketService(ParkingSocketService, true);

    const fetchingRef = useRef(false);
    const initialLoadRef = useRef(true);

    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'floorMap' | 'carInfo'>('floorMap');
    const [filters, setFilters] = useState<ProcessedFilters>({
        zone: 'A',
        floor: '01',
        row: null,
        spot: null,
    });

    const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
    const [slotData, setSlotData] = useState<Slot | null>({
        parking_id: '',
        floor: '',
        zone: '',
        row: '',
        spot: '',
        x_coordinate: 0,
        y_coordinate: 0,
        z_coordinate: 0
    });

    const [slotStatsData, setSlotStatsData] = useState<SlotStats[]>([{
        occupied: [],
        available: [],
        summary: {
            total: 0,
            occupied: 0,
            available: 0,
            location: {
                zone: 'A',
                floor: '01'
            }
        }
    }]);

    const validateFilters = useCallback((filters: ProcessedFilters): boolean => {
        if (!filters.zone) {
            setError("กรุณาเลือกลานจอดรถ");
            return false;
        }
        if (!filters.floor) {
            setError("กรุณาเลือกชั้นจอดรถ");
            return false;
        }
        if (filters.spot && !filters.row) {
            setError("กรุณาเลือกแถวจอดรถเมื่อเลือกช่องจอดรถ");
            return false;
        }
        if (filters.row && !filters.spot) {
            setError("กรุณาเลือกช่องจอดรถเมื่อเลือกแถวจอดรถ");
            return false;
        }
        return true;
    }, []);

    const fetchSlotByID = async (slotID: string) => {
        if (!token) {
            setError('Unauthorized: No token available');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/parkingrecord-active/findBySlot/${slotID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.message) {
                // ถ้ามี message แสดงว่าไม่พบข้อมูล
                setError(data.message);
                setSelectedCar(null);
                setSlotData(null);
                setViewMode('search');
            } else {
                // ถ้าพบข้อมูล
                setSlotData(data.slotInfo);
                setSelectedCar(data.carInfo);
                setViewMode('carInfo');
                setError(null);
            }
        } catch (error) {
            console.error('Fetch slot data error:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            setViewMode('search');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlotData = useCallback(() => {
        // ป้องกันการเรียกซ้ำซ้อน
        if (fetchingRef.current) {
            return;
        }

        // ตรวจสอบการเชื่อมต่อ socket
        if (!socket) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            setLoading(false);
            return;
        }
        
        if (!socket.connected) {
            // ถ้าเป็นการโหลดครั้งแรก ให้แสดง loading แทนข้อความรอการเชื่อมต่อ
            if (initialLoadRef.current) {
                setLoading(true);
                return;
            }
            
            setError('รอการเชื่อมต่อ...');
            return;
        }

        // ตรวจสอบ filters
        if (!validateFilters(filters)) {
            return;
        }

        // ตั้งค่าเป็นกำลังเรียก API และกำลังโหลด
        fetchingRef.current = true;
        setLoading(true);
        // ล้าง error ก่อนเรียก API
        setError(null);
        
        try {
            socket.emit('getSlotStatus', {
                zone: filters.zone,
                floor: filters.floor
            }, (response: WebSocketResponse<SlotStats[]>) => {
                fetchingRef.current = false;
                initialLoadRef.current = false;
                
                if (response.success) {
                    setSlotStatsData(response.data);
                    setError(null);
                } else {
                    setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
                }
                setLoading(false);
            });
        } catch (err) {
            console.error('Error fetching slot data:', err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            setLoading(false);
            fetchingRef.current = false;
            initialLoadRef.current = false;
        }
    }, [socket, filters, validateFilters]);

    const fetchSlotByFilter = async (filter: {
        zone: string;
        floor: string;
        row: string;
        spot: string;
    }) => {
        if (!token) {
            setError('Unauthorized: No token available');
            setLoading(false);
            return;
        }
    
        setLoading(true);
        try {
            const response = await fetch(
                `${API_CONFIG.baseURL}/parkingrecord-active/slot?${new URLSearchParams(filter)}`, 
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (data.message) {
                setError(data.message);
                setSelectedCar(null);
                setSlotData(null);
                setViewMode('search');
            } else {
                setSlotData(data.slotInfo);
                setSelectedCar(data.carInfo);
                setViewMode('carInfo');
                setError(null);
            }
        } catch (error) {
            console.error('Fetch slot data error:', error);
            setError('ไม่พบข้อมูลช่องจอดที่ระบุ');
            setViewMode('search');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = useCallback((searchParams: SearchFields) => {
        // กรองออก `page` และ `limit` จาก searchParams
        const { page, limit, ...paramsToCheck } = searchParams;
    
        // ตรวจสอบว่ามีค่ากรอกหรือไม่ในฟิลด์อื่น ๆ ยกเว้น `page` และ `limit`
        const hasSearchValues = Object.values(paramsToCheck).some(value =>
            value !== undefined && value !== '' && value !== null
        );
    
        // ถ้าไม่มีค่าในการค้นหาก็ไม่ทำการค้นหา
        if (!hasSearchValues) {
            return;
        }
    
        // ประมวลผลค่าและแปลงเป็นรูปแบบที่ต้องการ (เช่น แปลงวันที่เป็น ISO string)
        const updatedFilters = {
            ...filters,
            ...Object.entries(paramsToCheck).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value === undefined ? null : value
            }), {}),
            page: 1 // เพิ่ม page เป็น 1 เพื่อการค้นหาใหม่
        };
    
        // ตรวจสอบว่า filters ผ่านการ validate หรือไม่
        if (!validateFilters(updatedFilters)) {
            return;
        }
    
        // ตั้งค่าฟิลเตอร์ที่อัปเดต
        setFilters(updatedFilters);
        // ล้าง error ก่อนเริ่มค้นหา
        setError(null);
        setLoading(true);
    
        // กรณีที่ 1: มีแค่ zone และ floor - ใช้ socket
        if (searchParams.zone && searchParams.floor && !searchParams.row && !searchParams.spot) {
            setViewMode('floorMap');
            fetchSlotData(); // ใช้ fetchSlotData ที่มีอยู่แล้ว
        } 
        // กรณีที่ 2: มีครบทั้ง zone, floor, slot, spot - ใช้ API
        else if (searchParams.zone && searchParams.floor && searchParams.row && searchParams.spot) {
            fetchSlotByFilter({
                zone: searchParams.zone,
                floor: searchParams.floor,
                row: searchParams.row,
                spot: searchParams.spot
            });
        }
    }, [filters, fetchSlotData, validateFilters, fetchSlotByFilter]);

    const handleClear = useCallback(() => {
        setViewMode('floorMap');
        setError(null);
        const initialFilters = {
            zone: 'A',
            floor: '01',
            row: null,
            spot: null,
        };
        setFilters(initialFilters);
        fetchSlotData();
    }, [fetchSlotData]);

    const handleClick = useCallback((area: any) => {
        const parkingSlotId = area.id.split("-")[0];
        fetchSlotByID(parkingSlotId);
    }, []);

    const handleBack = useCallback(() => {
        setViewMode('floorMap');
        setSelectedCar(null);
        setSlotData(null);
        setError(null);
    }, []);

    // Socket connection setup
    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            console.log('🔗 Socket connected successfully');
            setIsConnected(true);
            // ล้าง error เมื่อเชื่อมต่อสำเร็จ
            setError(null);
            
            // เมื่อเชื่อมต่อได้แล้ว และอยู่ในโหมด floorMap ให้โหลดข้อมูล
            if (viewMode === 'floorMap') {
                fetchSlotData();
            }
        };

        const handleDisconnect = () => {
            console.log('⚠️ Socket disconnected');
            setIsConnected(false);
            setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
        };

        const handleStatusUpdate = (update: WebSocketResponse<SlotStats[]>) => {
            if (update.success) {
                setSlotStatsData(update.data);
                setError(null);
            }
        };

        // เพิ่ม handlers สำหรับ recordCreated และ recordRemoved
        const handleRecordCreated = (update: WebSocketResponse<any>) => {
            if (update.success) {
                // อัพเดท slot stats เมื่อมีรถเข้าจอด
                if (viewMode === 'floorMap') {
                    fetchSlotData();
                }
            }
        };

        const handleRecordRemoved = (update: WebSocketResponse<any>) => {
            if (update.success) {
                // อัพเดท slot stats เมื่อมีรถออก
                if (viewMode === 'floorMap') {
                    fetchSlotData();
                }
                // ถ้ากำลังดูข้อมูลรถคันที่ออกไป ให้กลับไปหน้า floorMap
                if (viewMode === 'carInfo') {
                    handleBack();
                }
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('slotStatusUpdated', handleStatusUpdate);
        socket.on('recordCreated', handleRecordCreated);
        socket.on('recordRemoved', handleRecordRemoved);

        // ตรวจสอบว่า socket เชื่อมต่ออยู่แล้วหรือไม่
        if (socket.connected) {
            console.log('Socket already connected, initializing data');
            setIsConnected(true);
            setError(null);
            
            // เมื่อเชื่อมต่อได้แล้ว และอยู่ในโหมด floorMap ให้โหลดข้อมูล
            if (viewMode === 'floorMap') {
                fetchSlotData();
            }
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('slotStatusUpdated', handleStatusUpdate);
            socket.off('recordCreated', handleRecordCreated);
            socket.off('recordRemoved', handleRecordRemoved);
        };
    }, [socket, viewMode, fetchSlotData, handleBack]);

    return {
        loading,
        isConnected,
        error,
        slotData,
        slotStatsData,
        selectedCar,
        filters,
        viewMode,
        handleSearch,
        handleClear,
        handleClick,
        handleBack,
    };
};