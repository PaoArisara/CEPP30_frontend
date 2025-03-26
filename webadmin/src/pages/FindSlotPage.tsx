import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFindSlot } from '../hooks/useFindSlot';
import { SearchConfig } from '../types/Search';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Breadcrumb from '../components/layout/Breadcrumb';
import SearchDisplay from '../components/common/SearchDisplay';
import CarInfoDisplay from '../components/common/CarInfoDisplay';
import MapDisplay from '../components/common/MapDisplay';
import { AlertCircle, ChevronLeft } from 'lucide-react';

const FindSlotPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    slotData,
    slotStatsData,
    selectedCar,
    viewMode,
    filters,
    handleSearch,
    handleClear,
    handleClick,
    handleBack
  } = useFindSlot();

  const [searchConfig] = useState<SearchConfig[]>([
    {
      header: "ลานจอดรถ",
      key: "zone",
      placeholder: "เลือกลานจอด",
      type: "select",
      options: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
      ],
    },
    {
      header: "ชั้นจอดรถ",
      key: "floor",
      placeholder: "เลือกชั้นจอดรถ",
      type: "select",
      options: [
        { label: "01", value: "01" },
        { label: "02", value: "02" },
      ],
    },
  ]);

  if (authLoading || loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูล..." />;
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Get the current slot stats safely
  const currentSlotStats = slotStatsData?.[0];

  const renderFloorMap = () => {
    if (!currentSlotStats) return <></>;

    return (
      <div>
        <MapDisplay
          slot={currentSlotStats.occupied}
          slotEmpty={currentSlotStats.available}
          camera={null}
          map={currentSlotStats.summary?.location?.zone}
          handleClick={handleClick}
        />
      </div>
    );
  };

  const showNoDataMessage = !currentSlotStats || currentSlotStats.summary?.total === 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumb pageName="ค้นหาตำแหน่งช่องจอด" />

      {viewMode !== 'carInfo' && (
        <SearchDisplay
          searchConfig={searchConfig}
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />
      )}

      <div className='bg-white p-4 rounded'>
        <div className="flex justify-between items-center pb-4 w-full">
          <div className="text-header w-full">
            {viewMode === 'floorMap' && currentSlotStats && (
              <div className='flex w-full justify-between'>
                <p>ลานจอดรถ {filters.zone} ชั้น {filters.floor} ({currentSlotStats.summary.total || 0})</p>
                <div className="flex gap-4 mb-2 mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className='text-mediumGray'>
                      ว่าง: {currentSlotStats.summary?.available || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className='text-mediumGray'>
                      ไม่ว่าง: {currentSlotStats.summary?.occupied || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {(viewMode === 'search' || viewMode === 'carInfo') && (
              <button
                onClick={handleBack}
                className="flex items-center text-mediumGray hover:text-primary"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                <span>กลับ</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button
              onClick={handleClear}
              className="text-primary hover:underline ml-1 mt-2"
            >
              ล้างการค้นหา
            </button>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'floorMap' && !showNoDataMessage && renderFloorMap()}

        {viewMode === 'carInfo' && selectedCar && slotData && (
          <CarInfoDisplay
            selectedCar={selectedCar}
            slotData={slotData}
          />
        )}

        {/* No Data Display */}
        {showNoDataMessage && viewMode === 'floorMap' && (
          <div className="flex flex-col items-center justify-center py-12 rounded-lg">
            <div className="text-mediumGray mb-2 flex items-start gap-2">
              <AlertCircle className='w-5 h-5' />
              ไม่มีข้อมูลลานจอด {filters.zone} ชั้น {filters.floor}
              <button
                onClick={handleClear}
                className="text-primary hover:underline"
              >
                กลับไปค่าเริ่มต้น
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindSlotPage;