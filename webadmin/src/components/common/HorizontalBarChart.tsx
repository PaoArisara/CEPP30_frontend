import React, { useState, useEffect, useRef } from 'react';
import { InfoIcon } from 'lucide-react';
import InfoMapModal from '../modals/InfoMapModal';
import { SlotStats } from '../../types/Slot';
import _ from 'lodash';
import LoadingSpinner from './LoadingSpinner';

interface HorizontalBarChartProps {
  data: SlotStats[];
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [floorStats, setFloorStats] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    percentage: 0
  });
  const [zone, setZone] = useState<string>('');
  
  // Use refs to store full floor data and prevent excessive updates
  const lastUpdateRef = useRef<number>(0);
  const dataRef = useRef<SlotStats[]>([]);
  const floorDataMapRef = useRef<Record<string, any>>({});
  
  // Update data when it changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Store data in ref
    dataRef.current = data;
    
    // Check last update time to throttle updates
    const now = Date.now();
    if (now - lastUpdateRef.current < 500) {
      // If we just updated, wait before updating again
      const timeout = setTimeout(() => {
        processData();
      }, 500);
      return () => clearTimeout(timeout);
    }
    
    processData();
  }, [data]);
  
  // Process data function
  const processData = () => {
    // Update last update time
    lastUpdateRef.current = Date.now();
    
    // Get current data from ref
    const currentData = dataRef.current;
    if (!currentData || currentData.length === 0) return;
    
    // Get current zone
    const currentZone = currentData[0]?.summary?.location?.zone;
    if (currentZone) {
      setZone(currentZone);
    }
    
    // Initialize floor data map with existing data if available
    const floorDataMap = { ...floorDataMapRef.current };
    
    // Ensure expected floors are present
    const expectedFloors = ['01', '02'];
    expectedFloors.forEach(floor => {
      if (!floorDataMap[floor]) {
        floorDataMap[floor] = {
          floor,
          total: 0,
          occupied: 0,
          available: 0
        };
      }
    });
    
    // Process actual data received
    let totalSlots = 0;
    let totalOccupied = 0;
    let totalAvailable = 0;
    
    // Track which floors were updated in this batch
    const updatedFloors = new Set<string>();
    
    currentData.forEach(item => {
      if (!item.summary || !item.summary.location) return;
      
      const floor = item.summary.location.floor;
      if (!floor || floor.trim() === '') return;
      
      // Mark this floor as updated
      updatedFloors.add(floor);
      
      // Update floor data
      floorDataMap[floor] = {
        floor,
        total: item.summary.total || 0,
        occupied: item.summary.occupied || 0,
        available: item.summary.available || 0
      };
    });
    
    // Save the updated floor data map to ref
    floorDataMapRef.current = floorDataMap;
    
    // Calculate totals from all floors, not just the updated ones
    Object.values(floorDataMap).forEach(floorData => {
      totalSlots += floorData.total || 0;
      totalOccupied += floorData.occupied || 0;
      totalAvailable += floorData.available || 0;
    });
    
    // Convert to array and sort by floor
    const sortedFloors = Object.values(floorDataMap)
      .filter(item => item && item.floor && item.floor.trim() !== '')
      .sort((a, b) => Number(a.floor) - Number(b.floor));
    
    setFloorStats(sortedFloors);
    setTotalStats({
      total: totalSlots,
      occupied: totalOccupied,
      available: totalAvailable,
      percentage: totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0
    });
    
    console.log(`[HorizontalBarChart ${currentZone}] Updated floors: ${Array.from(updatedFloors).join(', ')}`);
    console.log(`[HorizontalBarChart ${currentZone}] Total floors: ${Object.keys(floorDataMap).length}`);
  };

  if (!data || data.length === 0) return <LoadingSpinner/>;

  return (
    <>
      <div className="w-full max-w-full p-6 bg-white rounded border-secondary border">
        <div className="mb-6 flex w-full justify-between gap-4 items-center">
          <div className="flex w-full justify-between items-center">
            <h2 className="text-2xl font-bold text-header">
              ลานจอด {zone}
            </h2>
            <p className="text-mediumGray">
              จำนวนที่จอดได้ {totalStats.available} / {totalStats.total} คัน
            </p>
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="text-primary hover:text-primaryContrast"
          >
            <InfoIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Total for all floors */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-header">รวมทุกชั้น</span>
            <span className="text-mediumGray">
              {totalStats.occupied}/{totalStats.total}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalStats.percentage}%` }}
            />
          </div>
        </div>

        {/* Individual floors */}
        {floorStats.map(({ floor, total, occupied }) => {
          const percentage = total > 0 ? (occupied / total) * 100 : 0;
          
          // Convert floor from '01' to '1' for better display
          const displayFloor = floor.replace(/^0+/, '');
          
          return (
            <div key={floor} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-header">ชั้น {displayFloor}</span>
                <span className="text-mediumGray">
                  {occupied}/{total}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Modal */}
      <InfoMapModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        zone={zone}
      />
    </>
  );
};

export default HorizontalBarChart;