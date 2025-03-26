// useDisplay.ts
import { useCallback, useEffect, useState, useRef } from "react";
import { SlotStats } from "../types/Slot";
import { WebSocketResponse } from "../types/Common";
import { ZoneFilters } from "../types/Search";
import { useSocketService } from "./socket/useSocketService";
import ParkingSocketService from "../services/ParkingSocketService";
import _ from 'lodash';

export const useDisplay = () => {
    const slotSocket = useSocketService(ParkingSocketService, true);

    const [isConnected, setIsConnected] = useState(false);
    const [loadingA, setLoadingA] = useState(false);
    const [loadingB, setLoadingB] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filtersA, setFiltersA] = useState<ZoneFilters>({
        zone: 'A',
        floor: '01',
    });

    const [filtersB, setFiltersB] = useState<ZoneFilters>({
        zone: 'B',
        floor: '01',
    });

    // ใช้ useRef เพื่อเก็บข้อมูลโดยไม่ทริกเกอร์ re-render
    const allDataRef = useRef<{
        A: Record<string, SlotStats>,
        B: Record<string, SlotStats>
    }>({
        A: {},
        B: {}
    });

    // กำหนดชั้นที่ต้องแสดงเสมอ
    const expectedFloors = {
        A: ['01', '02'],
        B: ['01', '02']
    };

    const [slotStatsAData, setSlotStatsAData] = useState<SlotStats[]>([]);
    const [slotStatsBData, setSlotStatsBData] = useState<SlotStats[]>([]);

    // ป้องกันการ query ซ้ำ
    const lastFetchTimeRef = useRef<Record<string, number>>({
        A: 0,
        B: 0
    });
    
    // ป้องกันการอัพเดตรัวๆ
    const throttleFetch = useCallback((zone: 'A' | 'B') => {
        const now = Date.now();
        const lastFetch = lastFetchTimeRef.current[zone];
        
        // ให้ fetch ได้ไม่บ่อยเกินไป (เช่น ทุก 2 วินาที)
        if (now - lastFetch > 2000) {
            lastFetchTimeRef.current[zone] = now;
            return true;
        }
        return false;
    }, []);

    // สร้าง empty slot stats สำหรับชั้นที่ไม่มีข้อมูล
    const createEmptySlotStats = useCallback((zone: 'A' | 'B', floor: string): SlotStats => {
        return {
            occupied: [],
            available: [],
            summary: {
                total: 0,
                occupied: 0,
                available: 0,
                location: {
                    zone,
                    floor
                }
            }
        };
    }, []);

    // ฟังก์ชันอัพเดต state ตาม ref
    const updateStateFromRef = useCallback(() => {
        // อัพเดต zone A
        const zoneAData: SlotStats[] = [];
        
        // เพิ่มทุกชั้นที่ต้องการแสดงเสมอ
        expectedFloors.A.forEach(floor => {
            const floorData = allDataRef.current.A[floor] || createEmptySlotStats('A', floor);
            zoneAData.push(floorData);
        });
        
        // อัพเดต zone B
        const zoneBData: SlotStats[] = [];
        
        // เพิ่มทุกชั้นที่ต้องการแสดงเสมอ
        expectedFloors.B.forEach(floor => {
            const floorData = allDataRef.current.B[floor] || createEmptySlotStats('B', floor);
            zoneBData.push(floorData);
        });
        
        // เรียงลำดับตามชั้น
        zoneAData.sort((a, b) => {
            const floorA = a.summary.location.floor;
            const floorB = b.summary.location.floor;
            return Number(floorA) - Number(floorB);
        });
        
        zoneBData.sort((a, b) => {
            const floorA = a.summary.location.floor;
            const floorB = b.summary.location.floor;
            return Number(floorA) - Number(floorB);
        });
        
        setSlotStatsAData(zoneAData);
        setSlotStatsBData(zoneBData);
    }, [createEmptySlotStats]);

    const fetchZoneData = useCallback((zone: 'A' | 'B') => {
        if (!slotSocket?.connected || !isConnected) {
            setError('รอการเชื่อมต่อ...');
            return;
        }

        // ตรวจสอบว่าควร fetch หรือไม่
        if (!throttleFetch(zone)) {
            return;
        }

        // Set loading state for specific zone
        if (zone === 'A') {
            setLoadingA(true);
        } else {
            setLoadingB(true);
        }

        try {
            slotSocket.emit('getSlotStatus', {
                zone
            }, (response: WebSocketResponse<SlotStats[]>) => {
                if (response.success) {
                    // อัพเดตข้อมูลตามชั้น
                    if (zone === 'A') {
                        response.data.forEach(item => {
                            const floor = item.summary.location.floor;
                            if (floor && floor.trim() !== '') {
                                allDataRef.current.A[floor] = item;
                            }
                        });
                        setLoadingA(false);
                    } else {
                        response.data.forEach(item => {
                            const floor = item.summary.location.floor;
                            if (floor && floor.trim() !== '') {
                                allDataRef.current.B[floor] = item;
                            }
                        });
                        setLoadingB(false);
                    }
                    
                    // อัพเดต state เพียงครั้งเดียว
                    updateStateFromRef();
                    setError(null);
                } else {
                    setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
                    // Reset loading state on error
                    if (zone === 'A') {
                        setLoadingA(false);
                    } else {
                        setLoadingB(false);
                    }
                }
            });
        } catch (err) {
            console.error(`Error fetching Zone ${zone} data:`, err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            // Reset loading state on error
            if (zone === 'A') {
                setLoadingA(false);
            } else {
                setLoadingB(false);
            }
        }
    }, [slotSocket, isConnected, updateStateFromRef, throttleFetch]);

    const fetchAllZonesData = useCallback(() => {
        fetchZoneData('A');
        fetchZoneData('B');
    }, [fetchZoneData]);

    const updateZoneFloor = useCallback((zone: 'A' | 'B', floor: string) => {
        if (zone === 'A') {
            setFiltersA(prev => ({ ...prev, floor }));
        } else {
            setFiltersB(prev => ({ ...prev, floor }));
        }
    }, []);

    useEffect(() => {
        if (!slotSocket) return;

        const handleConnect = () => {
            console.log('🔗 Socket connected successfully');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('⚠️ Socket disconnected');
            setIsConnected(false);
            setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
        };

        const handleStatusUpdate = (update: WebSocketResponse<SlotStats[]>) => {
            if (update.success && update.data.length > 0) {
                const firstSlotStats = update.data[0];
                const zone = firstSlotStats.summary.location.zone;
                console.log(`Status update for zone ${zone}, floors:`, update.data.map(d => d.summary.location.floor));
                
                // อัพเดตเฉพาะชั้นที่มีข้อมูลใหม่
                if (zone === 'A') {
                    update.data.forEach(item => {
                        const floor = item.summary.location.floor;
                        if (floor && floor.trim() !== '') {
                            allDataRef.current.A[floor] = item;
                        }
                    });
                } else if (zone === 'B') {
                    update.data.forEach(item => {
                        const floor = item.summary.location.floor;
                        if (floor && floor.trim() !== '') {
                            allDataRef.current.B[floor] = item;
                        }
                    });
                }
                
                // อัพเดต state หลังจากอัพเดตข้อมูล
                updateStateFromRef();
                setError(null);
            }
        };

        // ใช้ debounce สำหรับ handler เพื่อลดการเรียกซ้ำ
        let recordChangeTimeout: NodeJS.Timeout | null = null;
        
        const handleRecordChange = () => {
            // ยกเลิก timeout เดิม
            if (recordChangeTimeout) {
                clearTimeout(recordChangeTimeout);
            }
            
            // รอสักครู่แล้วค่อย fetch ข้อมูล
            recordChangeTimeout = setTimeout(() => {
                fetchAllZonesData();
            }, 500);
        };

        slotSocket.on('connect', handleConnect);
        slotSocket.on('disconnect', handleDisconnect);
        slotSocket.on('slotStatusUpdated', handleStatusUpdate);
        slotSocket.on('recordCreated', handleRecordChange);
        slotSocket.on('recordRemoved', handleRecordChange);

        if (slotSocket.connected) {
            setIsConnected(true);
            setError(null);
        }

        return () => {
            if (recordChangeTimeout) {
                clearTimeout(recordChangeTimeout);
            }
            
            slotSocket.off('connect', handleConnect);
            slotSocket.off('disconnect', handleDisconnect);
            slotSocket.off('slotStatusUpdated', handleStatusUpdate);
            slotSocket.off('recordCreated', handleRecordChange);
            slotSocket.off('recordRemoved', handleRecordChange);
        };
    }, [slotSocket, fetchAllZonesData, updateStateFromRef]);

    // เมื่อเชื่อมต่อสำเร็จ, ดึงข้อมูลครั้งแรก
    useEffect(() => {
        if (isConnected) {
            // ดีเลย์การ fetch ข้อมูลเริ่มต้นสักเล็กน้อย
            const timer = setTimeout(() => {
                fetchAllZonesData();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [isConnected, fetchAllZonesData]);

    return {
        loadingA,
        loadingB,
        isConnected,
        error,
        slotStatsAData,
        slotStatsBData,
        filtersA,
        filtersB,
        updateZoneFloor,
    };
};