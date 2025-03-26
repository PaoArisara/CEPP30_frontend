import { useCallback, useEffect, useState } from "react";
import { Camera, CameraResponse, CameraStatus, HistoryResponse } from "../types/Camera";
import { ProcessedFilters, SearchConfig, SearchFields } from "../types/Search";
import { useAuth } from "../context/AuthContext";
import { WebSocketResponse } from "../types/Common";
import { useSocketService } from "./socket/useSocketService";
import CameraSocketService from "../services/CameraSocketService";

const initialFilters: ProcessedFilters = {
    page: 1,
    limit: 10,
    camera_id: null,
    floor: null,
    zone: null,
    status: null
};

export const useCamera = () => {
    const socket = useSocketService(CameraSocketService,true);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearch, setIsSearch] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryResponse>({
        data: [],
        meta: { lastPage: 0, total: 0, page: 1, limit: 10 }
    });

    const [cameras, setCameras] = useState<CameraResponse>({
        data: [],
        meta: { total: 0, totalPages: 0, page: 1, limit: 10 }
    });

    const { user } = useAuth();

    // UI States
    const [activeTab, setActiveTab] = useState<string>('all');
    const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    // Filter States
    const [filters, setFilters] = useState<ProcessedFilters>(initialFilters);

    // WebSocket Event Handlers
    const handleCameraUpdate = useCallback((data: any) => {
        if (data.updatedCamera) {
            setCameras(prev => ({
                ...prev,
                data: prev.data.map(camera =>
                    camera.camera_id === data.updatedCamera.camera_id
                        ? data.updatedCamera
                        : camera
                )
            }));
        } else if (Array.isArray(data.data)) {
            setCameras(data);
        }
        setLastRefreshTime(new Date());
    }, []);

    // WebSocket Connection Setup
    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            console.log('Socket connected successfully');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
            setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('camerasUpdated', handleCameraUpdate);

        // เช็คสถานะปัจจุบันของ socket
        if (socket.connected) {
            setIsConnected(true);
            setError(null);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('camerasUpdated', handleCameraUpdate);
        };
    }, [socket]);

    // แยก effect สำหรับการ fetch ข้อมูล
    useEffect(() => {
        if (isConnected) {
            console.log('Connection established, fetching initial data...');
            fetchCamerasData();
        }
    }, [isConnected]);

    // Data Fetching
    const fetchCamerasData = useCallback(async () => {
        if (!socket?.connected || !isConnected) {
            console.log('Cannot fetch: Socket not ready', {
                socketExists: !!socket,
                socketConnected: socket?.connected,
                isConnected
            });
            setError('รอการเชื่อมต่อ...');
            return;
        }

        console.log('Fetching cameras with filters:', filters);
        setLoading(true);

        try {
            socket.emit('getPage', filters, (response: WebSocketResponse<CameraResponse>) => {  // ลบ / ออก
                console.log('Received camera data:', response);
                if (response.success) {
                    setCameras(response.data);
                    setLastRefreshTime(new Date());
                    setError(null);
                } else {
                    console.error('Failed to fetch cameras:', response.error);
                    setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
                }
                setLoading(false);
            });
        } catch (err) {
            console.error('Error emitting getPage:', err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            setLoading(false);
        }
    }, [socket, isConnected, filters]);

    // Filter Handlers
    const handleSearch = useCallback((searchParams: SearchFields) => {
        // Check if any search parameter has a value
        const hasSearchValues = Object.values(searchParams).some(value => 
            value !== undefined && value !== null && value !== ''
        );
        setIsSearch(hasSearchValues);

        const processedParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
            if (value === undefined) {
                acc[key] = null;
            } else if (value instanceof Date) {
                acc[key] = value.toISOString();
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as Partial<ProcessedFilters>);

        setFilters(prev => ({
            ...prev,
            ...processedParams,
            page: 1
        }));
    }, []);


    const handleClear = useCallback(() => {
        setIsSearch(false);
        setFilters(initialFilters);
        setActiveTab('all');
    }, []);


    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
        const statusMap: Record<string, CameraStatus | null> = {
            all: null,
            active: 'ปกติ',
            waiting: 'รอดำเนินการ',
            broken: 'ชำรุด'
        };

        setFilters(prev => ({
            ...prev,
            status: statusMap[tab] || null,
            page: 1
        }));
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    // Camera Actions
    const handleStatusUpdate = useCallback((updatedCamera: {
        camera_id: string;
        status: CameraStatus;
        note?: string
    }) => {
        const payload = {
            id: updatedCamera.camera_id,
            status: updatedCamera.status,
            userId: user?.username,
            note: updatedCamera.note || "Status updated"
        }

        if (!socket || !isConnected) {
            setError('รอการเชื่อมต่อ...');
            return;
        }

        socket.emit('updateStatus', payload, (response: WebSocketResponse<CameraResponse>) => {
            if (response.success) {
                setCameras(prev => ({
                    ...prev,
                    data: prev.data.map(camera =>
                        camera.camera_id === updatedCamera.camera_id
                            ? { ...camera, status: updatedCamera.status }
                            : camera
                    )
                }));
            } else {
                setError(response.error || 'ไม่สามารถอัพเดตสถานะได้');
            }
        });
    }, [socket, isConnected, user]);

    // History Functions
    const getHistory = useCallback(async (cameraId: string, page = 1, limit = 10) => {
        if (!socket || !isConnected) {
            setHistoryError('รอการเชื่อมต่อ...');
            return;
        }

        setHistoryLoading(true);
        socket.emit('getHistory', {
            cameraId,
            page,
            limit
        }, (response: WebSocketResponse<HistoryResponse>) => {
            if (response.success) {
                setHistory(response.data);
                setHistoryError(null);
            } else {
                setHistoryError(response.error || 'ไม่สามารถโหลดประวัติได้');
            }
            setHistoryLoading(false);
        });
    }, [socket, isConnected]);

    useEffect(() => {
        if (!socket) return;

        const handleHistoryError = (error: any) => {
            if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
                setHistoryError('กรุณาเข้าสู่ระบบใหม่');
            } else {
                setHistoryError(error.message || 'เกิดข้อผิดพลาดในการโหลดประวัติ');
            }
            setHistoryLoading(false);
        };

        socket.on('historyError', handleHistoryError);

        return () => {
            socket.off('historyError', handleHistoryError);
        };
    }, [socket]);

    // Modal Controls
    const handleModalControl = useCallback((modalType: 'history' | 'maintenance', camera: Camera) => {
        setSelectedCamera(camera);
        if (modalType === 'history') {
            setShowHistoryModal(true);
            getHistory(camera.camera_id);
        } else {
            setShowMaintenanceModal(true);
        }
    }, [getHistory]);

    const closeModals = useCallback(() => {
        setShowHistoryModal(false);
        setShowMaintenanceModal(false);
        setSelectedCamera(null);
    }, []);

    // Auto-fetch on filters change
    useEffect(() => {
        if (isConnected) {
            fetchCamerasData();
        }
    }, [filters, isConnected, fetchCamerasData]);

    return {
        // States
        loading,
        isConnected,
        error,
        cameras,
        filters,
        activeTab,
        lastRefreshTime,
        selectedCamera,
        showHistoryModal,
        showMaintenanceModal,
        historyLoading,
        historyError,
        history,
        isSearch,

        // Handlers
        handleSearch,
        handlePageChange,
        handleClear,
        handleTabChange,
        handleStatusUpdate,
        handleModalControl,
        closeModals,
        fetchCamerasData,
        getHistory,

        // Additional Controls
        setSelectedCamera
    };
};

// Configuration exports
export const statusColors: Record<CameraStatus, string> = {
    'ปกติ': 'bg-green-100 text-green-800',
    'ชำรุด': 'bg-red-100 text-red-800',
    'รอดำเนินการ': 'bg-yellow-100 text-yellow-800',
    'ไม่ได้ใช้งาน': 'bg-gray-100 text-gray-800'
};

export const searchConfig: SearchConfig[] = [
    {
        header: "ลานจอด",
        key: "zone",
        placeholder: "เลือกลานจอด",
        type: "select",
        options: [
            { label: "ลานจอด A", value: "A" },
            { label: "ลานจอด B", value: "B" },
        ],
    },
    {
        header: "ชั้น",
        key: "floor",
        placeholder: "เลือกชั้น",
        type: "select",
        options: [
            { label: "ชั้น 01", value: "01" },
            { label: "ชั้น 02", value: "02" },
        ],
    },
];

export const headersConfig = [
    { label: 'รหัสกล้อง', key: 'camera_id' },
    { label: 'ตำแหน่ง', key: 'location' },
    { label: 'สถานะ', key: 'status' },
    { label: 'อัปเดตล่าสุด', key: 'lastStatusChange' },
];