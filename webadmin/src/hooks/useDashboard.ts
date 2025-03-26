// hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { WebSocketResponse } from '../types/Common';
import { useAuth } from '../context/AuthContext';
import { useSocketService } from './socket/useSocketService';
import LogSocketService from '../services/LogSocketService';
import ParkingSocketService from '../services/ParkingSocketService';
import { DaylyTrend, ParkingData, SlotCount, SlotStats } from '../types/Slot';
import { API_CONFIG } from '../config/ApiConfig';
import { CameraCount } from '../types/Camera';

// Define separate interfaces for chart data to ensure type safety
interface ZoneChartData {
    monthlyTrend: any[];
    yearlyTrend: any[];
}

interface ZonePeakChartData {
    peakHourAnalysis: {
        hourlyData: any[];
        peakHours: {
            occupancy: { hour: number; count: number };
            entry: { hour: number; count: number };
            exit: { hour: number; count: number };
        }
    },
    daylyTrend: DaylyTrend[];
}

function useDashboard() {
    const { token, refreshAccessToken, logout } = useAuth();

    const logSocket = useSocketService(LogSocketService, true);
    const slotSocket = useSocketService(ParkingSocketService, true);

    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Camera and Slot Data
    const [cameraData, setCameraData] = useState({ total: 0 });
    const [slotData, setSlotData] = useState({ total: 0 });

    // Slot Status Data
    const [slotStatsAData, setSlotStatsAData] = useState<SlotStats[]>([{
        occupied: [],
        available: [],
        summary: {
            total: 0,
            occupied: 0,
            available: 0,
            location: { zone: '', floor: '' }
        }
    }]);

    const [slotStatsBData, setSlotStatsBData] = useState<SlotStats[]>([{
        occupied: [],
        available: [],
        summary: {
            total: 0,
            occupied: 0,
            available: 0,
            location: { zone: '', floor: '' }
        }
    }]);

    // Separated chart data states with clearer typing
    const [zoneAChartData, setZoneAChartData] = useState<{
        trendChart: ZoneChartData;
        peakChart: ZonePeakChartData;
    }>({
        trendChart: {
            monthlyTrend: [],
            yearlyTrend: []
        },
        peakChart: {
            peakHourAnalysis: {
                hourlyData: [],
                peakHours: {
                    occupancy: { hour: 0, count: 0 },
                    entry: { hour: 0, count: 0 },
                    exit: { hour: 0, count: 0 }
                }
            },
            daylyTrend: [{
                date: '',
                totalParkings: 0,
                totalDuration: 0,
                averageDuration: '',
                revenue: 0
            }]
        },
    });

    const [zoneBChartData, setZoneBChartData] = useState<{
        trendChart: ZoneChartData;
        peakChart: ZonePeakChartData;
    }>({
        trendChart: {
            monthlyTrend: [],
            yearlyTrend: []
        },
        peakChart: {
            peakHourAnalysis: {
                hourlyData: [],
                peakHours: {
                    occupancy: { hour: 0, count: 0 },
                    entry: { hour: 0, count: 0 },
                    exit: { hour: 0, count: 0 }
                }
            },
            daylyTrend: [{
                date: '',
                totalParkings: 0,
                totalDuration: 0,
                averageDuration: '',
                revenue: 0
            }]
        }
    });

    // Chart options with separate states for each zone
    const [zoneAChartOptions, setZoneAChartOptions] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

    const [zoneBChartOptions, setZoneBChartOptions] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

    // Fetch trend chart data for a specific zone
    const fetchTrendChartData = useCallback((options: { year: number; month: number }, zone: 'A' | 'B') => {
        if (!logSocket?.connected || !isConnected) {
            console.log(`Cannot fetch trend data for zone ${zone}: Socket not connected`);
            return;
        }

        // Update options based on the specific zone
        if (zone === 'A') {
            setZoneAChartOptions(options);
        } else {
            setZoneBChartOptions(options);
        }

        console.log(`Fetching trend data for zone ${zone} with options:`, options);

        try {
            logSocket.emit('getDashboardStats', { ...options, zone }, (response: WebSocketResponse<ParkingData>) => {
                console.log(`Received trend data for zone ${zone}:`, response.success ? 'success' : 'failed');
                
                if (response.success) {
                    const processedData = {
                        monthlyTrend: response.data.monthlyTrend || [],
                        yearlyTrend: response.data.yearlyTrend || []
                    };

                    if (zone === 'A') {
                        setZoneAChartData(prev => ({
                            ...prev,
                            trendChart: processedData
                        }));
                    } else {
                        setZoneBChartData(prev => ({
                            ...prev,
                            trendChart: processedData
                        }));
                    }
                } else {
                    console.error(`Error fetching trend data for zone ${zone}:`, response.error);
                }
            });
        } catch (err) {
            console.error(`Error in fetchTrendChartData for zone ${zone}:`, err);
        }
    }, [logSocket, isConnected]);

    // Fetch peak chart data for a specific zone
    const fetchPeakChartData = useCallback((options: { year: number; month: number }, zone: 'A' | 'B') => {
        if (!logSocket?.connected || !isConnected) {
            console.log(`Cannot fetch peak data for zone ${zone}: Socket not connected`);
            return;
        }

        // Update options based on the specific zone
        if (zone === 'A') {
            setZoneAChartOptions(options);
        } else {
            setZoneBChartOptions(options);
        }

        console.log(`Fetching peak data for zone ${zone} with options:`, options);

        try {
            logSocket.emit('getDashboardStats', { ...options, zone }, (response: WebSocketResponse<ParkingData>) => {
                console.log(`Received peak data for zone ${zone}:`, response.success ? 'success' : 'failed');
                
                if (response.success) {
                    const processedData = {
                        peakHourAnalysis: response.data.peakHourAnalysis || {
                            hourlyData: [],
                            peakHours: {
                                occupancy: { hour: 0, count: 0 },
                                entry: { hour: 0, count: 0 },
                                exit: { hour: 0, count: 0 }
                            }
                        },
                        daylyTrend: response.data.daylyTrend || []
                    };

                    if (zone === 'A') {
                        setZoneAChartData(prev => ({
                            ...prev,
                            peakChart: processedData
                        }));
                    } else {
                        setZoneBChartData(prev => ({
                            ...prev,
                            peakChart: processedData
                        }));
                    }
                } else {
                    console.error(`Error fetching peak data for zone ${zone}:`, response.error);
                }
            });
        } catch (err) {
            console.error(`Error in fetchPeakChartData for zone ${zone}:`, err);
        }
    }, [logSocket, isConnected]);

    // Fetch camera data
    const fetchCameraData = useCallback(async () => {
        console.log('[Dashboard] Fetching camera data');
        if (!token) {
            setError('Unauthorized: No token available');
            return null;
        }

        try {
            const response = await fetch(`${API_CONFIG.baseURL}/camera/floor-counts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // If unauthorized, attempt to refresh token
            if (response.status === 401) {
                console.log('Token expired, attempting to refresh');
                const refreshed = await refreshAccessToken();
                
                if (!refreshed) {
                    // If refresh fails, logout user
                    logout(true);
                    return null;
                }

                // Retry the fetch with the new token
                return fetchCameraData();
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch camera data: ${response.status}`);
            }

            const data: CameraCount = await response.json();
            const totalSum = Object.values(data).reduce((sum, category) => {
                return sum + Object.values(category).reduce((categorySum, floor) => {
                    return categorySum + floor.total;
                }, 0);
            }, 0);

            setCameraData({ ...data, total: totalSum });
            setError(null);
            return data;
        } catch (error) {
            console.error('Fetch camera data error:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลกล้อง');
            return null;
        }
    }, [token, refreshAccessToken, logout]);

    // Fetch slot data
    const fetchSlotData = useCallback(async () => {
        console.log('[Dashboard] Fetching slot data');
        if (!token) {
            setError('Unauthorized: No token available');
            return;
        }

        try {
            const response = await fetch(`${API_CONFIG.baseURL}/parkingslot/floor-counts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch slot data');
            }

            const data: SlotCount = await response.json();
            const totalSum = Object.values(data).reduce((sum, category) => {
                return sum + Object.values(category).reduce((categorySum, floor) => {
                    return categorySum + floor.total;
                }, 0);
            }, 0);

            setSlotData({ ...data, total: totalSum });
            setError(null);
        } catch (error) {
            console.error('Fetch slot data error:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลที่จอดรถ');
        }
    }, [token]);

    // Fetch slot status for all zones
    const fetchAllZonesData = useCallback(() => {
        if (!slotSocket?.connected || !isConnected) {
            setError('รอการเชื่อมต่อ...');
            return;
        }

        console.log('[Dashboard] Fetching all zones data');

        try {
            ['A', 'B'].forEach((zone) => {
                slotSocket.emit('getSlotStatus', { zone }, (response: WebSocketResponse<SlotStats[]>) => {
                    if (response.success) {
                        if (zone === 'A') {
                            setSlotStatsAData(response.data);
                        } else {
                            setSlotStatsBData(response.data);
                        }
                        setError(null);
                    } else {
                        console.error(`Error fetching data for zone ${zone}:`, response.error);
                        setError(response.error || 'ไม่สามารถโหลดข้อมูลได้');
                    }
                });
            });
        } catch (err) {
            console.error(`Error in fetchAllZonesData:`, err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }, [slotSocket, isConnected]);

    // Refresh all chart data
    const refreshAllChartData = useCallback(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        console.log('[Dashboard] Refreshing all chart data');

        // Fetch data for both zones
        fetchTrendChartData({ year: currentYear, month: currentMonth }, 'A');
        fetchTrendChartData({ year: currentYear, month: currentMonth }, 'B');
        fetchPeakChartData({ year: currentYear, month: currentMonth }, 'A');
        fetchPeakChartData({ year: currentYear, month: currentMonth }, 'B');
    }, [fetchTrendChartData, fetchPeakChartData]);

    // Socket connection and event handling
    useEffect(() => {
        if (!token) {
            console.log('[Dashboard] No token available');
            setError('Unauthorized: No token available');
            return;
        }

        if (!logSocket || !slotSocket) return;

        const handleConnect = () => {
            console.log('🔗 Socket connected successfully');
            setIsConnected(true);
            setLoading(true);

            // Fetch initial data on connection
            Promise.all([
                fetchCameraData(),
                fetchSlotData(),
                fetchAllZonesData(),
                refreshAllChartData()
            ]).then(() => {
                console.log('[Dashboard] Initial data load complete');
                setLoading(false);
            }).catch((error) => {
                console.error('[Dashboard] Error loading initial data:', error);
                setLoading(false);
            });
        };

        const handleDisconnect = () => {
            console.log('⚠️ Socket disconnected');
            setIsConnected(false);
            setError('การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
            setLoading(true);
        };

        // Improved dashboard update handler
        const handleDashboardUpdate = (payload: any) => {
            console.log('[Dashboard] Update received:', payload);
            
            if (!payload.success || !payload.data?.statistics) {
                console.error('[Dashboard] Invalid update payload:', payload);
                return;
            }
            
            const { statistics } = payload.data;
            console.log('[Dashboard] Statistics structure:', Object.keys(statistics));
            
            // Handle zone-specific updates
            if (statistics.A) {
                console.log('[Dashboard] Updating Zone A data');
                setZoneAChartData(prevData => {
                    const zoneData = statistics.A;
                    return {
                        trendChart: {
                            monthlyTrend: zoneData.monthlyTrend || prevData.trendChart.monthlyTrend,
                            yearlyTrend: zoneData.yearlyTrend || prevData.trendChart.yearlyTrend
                        },
                        peakChart: {
                            peakHourAnalysis: zoneData.peakHourAnalysis || prevData.peakChart.peakHourAnalysis,
                            daylyTrend: zoneData.daylyTrend || prevData.peakChart.daylyTrend
                        }
                    };
                });
            }
            
            if (statistics.B) {
                console.log('[Dashboard] Updating Zone B data');
                setZoneBChartData(prevData => {
                    const zoneData = statistics.B;
                    return {
                        trendChart: {
                            monthlyTrend: zoneData.monthlyTrend || prevData.trendChart.monthlyTrend,
                            yearlyTrend: zoneData.yearlyTrend || prevData.trendChart.yearlyTrend
                        },
                        peakChart: {
                            peakHourAnalysis: zoneData.peakHourAnalysis || prevData.peakChart.peakHourAnalysis,
                            daylyTrend: zoneData.daylyTrend || prevData.peakChart.daylyTrend
                        }
                    };
                });
            }
            
            // Handle non-zone-specific updates (single zone update format)
            if (!statistics.A && !statistics.B && statistics.parkingUtilization) {
                // This is a general update, need to detect which zone it belongs to
                console.log('[Dashboard] Handling general statistics update, checking zone info');
                
                // Look for zone information in the payload
                const zoneInfo = payload.zone || payload.data.zone;
                
                if (zoneInfo === 'A') {
                    console.log('[Dashboard] General update identified as Zone A');
                    setZoneAChartData(prevData => ({
                        trendChart: {
                            monthlyTrend: statistics.monthlyTrend || prevData.trendChart.monthlyTrend,
                            yearlyTrend: statistics.yearlyTrend || prevData.trendChart.yearlyTrend
                        },
                        peakChart: {
                            peakHourAnalysis: statistics.peakHourAnalysis || prevData.peakChart.peakHourAnalysis,
                            daylyTrend: statistics.daylyTrend || prevData.peakChart.daylyTrend
                        }
                    }));
                } else if (zoneInfo === 'B') {
                    console.log('[Dashboard] General update identified as Zone B');
                    setZoneBChartData(prevData => ({
                        trendChart: {
                            monthlyTrend: statistics.monthlyTrend || prevData.trendChart.monthlyTrend,
                            yearlyTrend: statistics.yearlyTrend || prevData.trendChart.yearlyTrend
                        },
                        peakChart: {
                            peakHourAnalysis: statistics.peakHourAnalysis || prevData.peakChart.peakHourAnalysis,
                            daylyTrend: statistics.daylyTrend || prevData.peakChart.daylyTrend
                        }
                    }));
                } else {
                    console.log('[Dashboard] Unable to identify zone for general update, refreshing all data');
                    // If we can't determine the zone, refresh all data
                    refreshAllChartData();
                }
            }
        };

// Updated slot status update handler for useDashboard.ts

const handleSlotStatusUpdate = (update: WebSocketResponse<SlotStats[]>) => {
    console.log('[Dashboard] Slot status update received');
    
    if (!update.success || !update.data || update.data.length === 0) {
      console.error('[Dashboard] Invalid slot status update:', update);
      return;
    }
    
    const firstSlotStats = update.data[0];
    if (!firstSlotStats.summary || !firstSlotStats.summary.location) {
      console.error('[Dashboard] Missing location info in update:', update);
      return;
    }
    
    const zone = firstSlotStats.summary.location.zone;
    const floor = firstSlotStats.summary.location.floor;
    
    console.log(`[Dashboard] Updating slot stats for zone ${zone}, floor ${floor}`);
    
    if (zone === 'A') {
      // Merge the new data with existing data instead of replacing it completely
      setSlotStatsAData(prevData => {
        // If we don't have previous data, just use the new data
        if (!prevData || prevData.length === 0) {
          return update.data;
        }
        
        // Create a map of existing data keyed by floor
        const floorMap = prevData.reduce((map, item) => {
          if (item.summary && item.summary.location && item.summary.location.floor) {
            map[item.summary.location.floor] = item;
          }
          return map;
        }, {} as Record<string, SlotStats>);
        
        // Update the map with new data
        update.data.forEach(item => {
          if (item.summary && item.summary.location && item.summary.location.floor) {
            floorMap[item.summary.location.floor] = item;
          }
        });
        
        // Convert back to array
        return Object.values(floorMap);
      });
    } else if (zone === 'B') {
      // Similar logic for zone B
      setSlotStatsBData(prevData => {
        if (!prevData || prevData.length === 0) {
          return update.data;
        }
        
        const floorMap = prevData.reduce((map, item) => {
          if (item.summary && item.summary.location && item.summary.location.floor) {
            map[item.summary.location.floor] = item;
          }
          return map;
        }, {} as Record<string, SlotStats>);
        
        update.data.forEach(item => {
          if (item.summary && item.summary.location && item.summary.location.floor) {
            floorMap[item.summary.location.floor] = item;
          }
        });
        
        return Object.values(floorMap);
      });
    } else {
      console.log(`[Dashboard] Unknown zone in slot update: ${zone}`);
    }
  };

        // Add socket listeners
        console.log('[Dashboard] Setting up socket listeners');
        
        logSocket.on('connect', handleConnect);
        logSocket.on('disconnect', handleDisconnect);
        logSocket.on('dashboardUpdated', handleDashboardUpdate);

        slotSocket.on('connect', handleConnect);
        slotSocket.on('disconnect', handleDisconnect);
        slotSocket.on('slotStatusUpdated', handleSlotStatusUpdate);

        // Trigger initial connection check
        if (logSocket.connected && slotSocket.connected) {
            console.log('[Dashboard] Sockets already connected, initializing data');
            handleConnect();
            setError(null);
        } else {
            console.log('[Dashboard] Waiting for socket connections');
        }

        // Cleanup function
        return () => {
            console.log('[Dashboard] Cleaning up socket listeners');
            
            logSocket.off('connect', handleConnect);
            logSocket.off('disconnect', handleDisconnect);
            logSocket.off('dashboardUpdated', handleDashboardUpdate);

            slotSocket.off('connect', handleConnect);
            slotSocket.off('disconnect', handleDisconnect);
            slotSocket.off('slotStatusUpdated', handleSlotStatusUpdate);
        };
    }, [
        token,
        logSocket,
        slotSocket,
        fetchCameraData,
        fetchSlotData,
        fetchAllZonesData,
        fetchTrendChartData,
        fetchPeakChartData,
        refreshAllChartData
    ]);

    return {
        loading,
        isConnected,
        error,
        cameraData,
        slotData,
        slotStatsAData,
        slotStatsBData,
        fetchCameraData,
        fetchSlotData,
        fetchAllZonesData,
        // Separate chart data for each zone
        zoneAChartData,
        zoneBChartData,
        zoneAChartOptions,
        zoneBChartOptions,
        fetchTrendChartData,
        fetchPeakChartData,
        refreshAllChartData
    };
};
export default useDashboard;