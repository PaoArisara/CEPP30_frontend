import React from 'react';
import MapDisplay from './MapDisplay';
import { SlotStats } from '../../types/Slot';

export interface ParkingZoneProps {
    zone: 'A' | 'B';
    floor: string;
    slotStatsData: SlotStats[];
    loading: boolean;
    updateZoneFloor: (zone: 'A' | 'B', floor: string) => void;
    handleClick: (slot: any) => void;
  }

  
const ParkingZone: React.FC<ParkingZoneProps> = ({ 
  zone,
  floor,
  slotStatsData,
  loading,
  updateZoneFloor,
  handleClick 
}) => {
  const currentFloorData: SlotStats | undefined = slotStatsData.find(
    (data: SlotStats) => data.summary.location.floor === floor
  );

  return (
    <div className="bg-white rounded shadow-sm">
      <div className="p-4">
        <p className="text-xl font-bold text-header">
          ลานจอด {zone} ชั้น {floor}
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8">
            <div className="border rounded p-4 bg-gray-50 relative">
              {loading && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-gray-600">กำลังโหลด...</span>
                  </div>
                </div>
              )}
              <MapDisplay
                slot={currentFloorData?.occupied || []}
                slotEmpty={currentFloorData?.available || []}
                camera={null}
                map={zone}
                isLabel={false}
                handleClick={handleClick}
              />
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-mediumGray">
                  ว่าง: {currentFloorData?.summary.available || 0}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-mediumGray">
                  ไม่ว่าง: {currentFloorData?.summary.occupied || 0}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-mediumGray">
                  รวม: {currentFloorData?.summary.total || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-4">
            <div className="flex flex-col gap-2">
              {slotStatsData.map((data: SlotStats) => (
                <button
                  key={data.summary.location.floor}
                  disabled={loading}
                  onClick={() => updateZoneFloor(zone, data.summary.location.floor)}
                  className={`text-header p-3 rounded transition-colors ${
                    floor === data.summary.location.floor 
                      ? 'bg-primary text-white hover:bg-primaryContrast' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center px-2">
                    <span>ชั้น {data.summary.location.floor}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-semibold">{data.summary.available}</span>
                      <span className="text-sm opacity-75">/ {data.summary.total}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingZone;