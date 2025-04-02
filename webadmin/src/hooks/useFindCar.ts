import { useCallback, useEffect, useState } from "react";
import { ProcessedFilters, SearchFields } from "../types/Search";
import { WebSocketResponse } from "../types/Common";
import { CarData, ParkingActiveResponse } from "../types/Active";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../config/ApiConfig";
import { Slot } from "../types/Slot";
import { useSocketService } from "./socket/useSocketService";
import ActiveSocketService from "../services/ActiveSocketService";

const initialFilters: ProcessedFilters = {
  page: 1,
  limit: 6,
};
export const useFindCar = () => {
  const { token } = useAuth();

  const socket = useSocketService(ActiveSocketService, true);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);

  const [activeData, setActiveData] = useState<ParkingActiveResponse>({
    data: [],
    meta: { total: 0, lastPage: 0, page: 1, limit: 10 },
  });

  const [slotData, setSlotData] = useState<Slot>({
    parking_id: "",
    floor: "",
    zone: "",
    row: "",
    spot: "",
    x_coordinate: 0,
    y_coordinate: 0,
    z_coordinate: 0,
  });

  // Filter States
  const [filters, setFilters] = useState<ProcessedFilters>(initialFilters);

  // Real-time data fetching
  const fetchActiveData = useCallback(async () => {
    if (!socket?.connected || !isConnected) {
      setError("รอการเชื่อมต่อ...");
      return;
    }

    setLoading(true);
    try {
      socket.emit(
        "getPage",
        filters,
        (response: WebSocketResponse<ParkingActiveResponse>) => {
          if (response.success) {
            setActiveData(response.data);
            setError(null);
          } else {
            setError(response.error || "ไม่สามารถโหลดข้อมูลได้");
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setLoading(false);
    }
  }, [socket, isConnected, filters]);

  // Admin search function
  const searchByAdmin = useCallback(
    async (searchFilters: ProcessedFilters) => {
      if (!socket?.connected || !isConnected) {
        setError("รอการเชื่อมต่อ...");
        return;
      }

      setLoading(true);
      try {
        socket.emit(
          "searchAdmin",
          searchFilters,
          (response: WebSocketResponse<ParkingActiveResponse>) => {
            if (response.success) {
              setActiveData(response.data);
              setError(null);
            } else {
              setError(response.error || "ไม่สามารถค้นหาข้อมูลได้");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error in admin search:", err);
        setError("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
        setLoading(false);
      }
    },
    [socket, isConnected]
  );

  // Handle search
  const handleSearch = useCallback(
    (searchParams: SearchFields) => {
      // รีเซ็ต selected car เมื่อเริ่มการค้นหา
      setSelectedCar(null);

      // กรองออก `page` และ `limit` จาก searchParams
      const { page, limit, ...paramsToCheck } = searchParams;

      // ตรวจสอบว่ามีค่ากรอกหรือไม่ในฟิลด์อื่น ๆ ยกเว้น `page` และ `limit`
      const hasSearchValues = Object.values(paramsToCheck).some(
        (value) => value !== undefined && value !== "" && value !== null
      );

      // ถ้าไม่มีการกรอกข้อมูลใดๆ ให้ออกจากฟังก์ชันโดยไม่ทำอะไร
      if (!hasSearchValues) {
        // ถ้าปัจจุบันอยู่ในโหมดค้นหา ให้กลับไปโหมดปกติ
        if (isSearchMode) {
          setIsSearchMode(false);
          setFilters(initialFilters);
          fetchActiveData();
        }
        return;
      }

      // อัปเดตสถานะการค้นหา
      setIsSearchMode(true);

      // ประมวลผลค่าและแปลงเป็นรูปแบบที่ต้องการ (เช่น แปลงวันที่เป็น ISO string)
      const processedParams = Object.entries(paramsToCheck).reduce(
        (acc, [key, value]) => {
          if (value === undefined || value === "") {
            // ไม่รวมค่าว่างในพารามิเตอร์ที่ส่งไป
            return acc;
          } else if (value instanceof Date) {
            acc[key] = value.toISOString();
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Partial<ProcessedFilters>
      );

      // อัปเดต filters และเพิ่ม `page: 1`
      const updatedFilters = {
        ...initialFilters, // รีเซ็ตฟิลเตอร์ทั้งหมดกลับเป็นค่าเริ่มต้น
        ...processedParams, // แล้วค่อยเพิ่มค่าที่กรอกเข้ามา
      };

      setFilters(updatedFilters);

      // เรียกใช้ฟังก์ชันค้นหา
      searchByAdmin(updatedFilters);
    },
    [isSearchMode, searchByAdmin, fetchActiveData]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    // Check if we're already in default state (not in search mode and using default filters)
    const isDefaultPage = filters.page === initialFilters.page;
    const isDefaultLimit = filters.limit === initialFilters.limit;
    const hasNoExtraFilters = Object.keys(filters).length <= 2; // Only page and limit

    // If we're already showing default data with no search applied, do nothing
    if (!isSearchMode && isDefaultPage && isDefaultLimit && hasNoExtraFilters) {
      return; // Already in default state, no need to clear or fetch data
    }

    // Reset search mode
    setIsSearchMode(false);

    // Reset selected car if any
    setSelectedCar(null);

    // Reset filters to initial values
    setFilters(initialFilters);

    // Fetch fresh data
    fetchActiveData();
  }, [filters, isSearchMode, fetchActiveData]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setSelectedCar(null); // Reset selected car when changing page
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);

      if (isSearchMode) {
        searchByAdmin(updatedFilters);
      } else {
        fetchActiveData();
      }
    },
    [filters, isSearchMode, searchByAdmin, fetchActiveData]
  );

  const fetchSlotData = async (slotID: string) => {
    console.log("Fetching slot data:", { slotID, token });

    if (!token) {
      setError("Unauthorized: No token available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/parkingslot/${slotID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch slot data");
      }

      const data = await response.json();
      setSlotData(data);
      setError(null);
    } catch (error) {
      console.error("Fetch slot data error:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = useCallback(
    (car: CarData) => {
      setSelectedCar(car);
      console.log(car);

      fetchSlotData(car.parkingSlot.parking_id);
    },
    [fetchSlotData]
  );

  const handleBack = useCallback(() => {
    setSelectedCar(null);
  }, []);

  // Socket event handlers
  const handleActiveUpdate = useCallback(
    (data: any) => {
      // Only update if not in search mode
      if (!isSearchMode && data.success) {
        fetchActiveData();
      }
    },
    [fetchActiveData, isSearchMode]
  );

  // Socket connection setup
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("🔗 Socket connected successfully");
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log("⚠️ Socket disconnected");
      setIsConnected(false);
      setError("การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("recordCreated", handleActiveUpdate);
    socket.on("recordUpdated", handleActiveUpdate);
    socket.on("recordRemoved", handleActiveUpdate);
    socket.on("parkingStatus", handleActiveUpdate);

    if (socket.connected) {
      setIsConnected(true);
      setError(null);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("recordCreated", handleActiveUpdate);
      socket.off("recordUpdated", handleActiveUpdate);
      socket.off("recordRemoved", handleActiveUpdate);
      socket.off("parkingStatus", handleActiveUpdate);
    };
  }, [socket, handleActiveUpdate]);

  // Initial data fetch
  useEffect(() => {
    if (isConnected && !isSearchMode) {
      fetchActiveData();
    }
  }, [isConnected, isSearchMode, fetchActiveData]);

  return {
    loading,
    isConnected,
    error,
    activeData,
    slotData, // เพิ่ม slotData
    filters,
    isSearchMode,
    selectedCar,
    handleSearch,
    handlePageChange,
    handleClear,
    handleClick,
    handleBack,
  };
};
