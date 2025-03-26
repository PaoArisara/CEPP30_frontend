import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, HistoryIcon, SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { headersConfig, useParkingHistory } from '../hooks/useParkingHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Breadcrumb from '../components/layout/Breadcrumb';
import SearchDisplay from '../components/common/SearchDisplay';
import { TableDisplay } from '../components/common/TableDisplay';
import { CarInfoModal } from '../components/modals/CarInfoModal';
import { CarHistoryModal } from '../components/modals/CarHistoryModal';
import { Pagination } from '../components/common/Pagination';
import { ParkingLogItem } from '../types/Log';
import { SearchConfig } from '../types/Search';

const ParkingLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSearch, setIsSearch] = useState(false);

  const [searchConfig, setSearchConfig] = useState<SearchConfig[]>([
    {
      header: "วันที่และเวลาเข้า",
      key: "timestamp_in",
      placeholder: "เลือกวันที่",
      type: "dateTime",
    },
    {
      header: "วันที่และเวลาออก",
      key: "timestamp_out",
      placeholder: "เลือกวันที่",
      type: "dateTime",
    },
    {
      header: "เลขทะเบียน",
      key: "license_id",
      placeholder: "กรอกเลขทะเบียน",
      type: "text",
    },
    {
      header: "จังหวัด",
      key: "province",
      placeholder: "เลือกจังหวัด",
      type: "select",
      options: [],
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
  ]);

  const {
    loading,
    logs,
    activeMap,
    error,
    selectedCar,
    showCarInfoModal,
    showCarHistoryModal,
    filters,
    history,
    getCarHistory,
    handleMapChange,
    handleSearch,
    handleClear,
    handlePageChange,
    handleCarSelect,
    closeModals,
    fetchParkingData
  } = useParkingHistory();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json');
        const result = await response.json();
        const provinceOptions = result.map((province: { name_th: string }) => ({
          label: province.name_th,
          value: province.name_th
        }));
        provinceOptions.sort((a: { label: string; }, b: { label: any; }) => a.label.localeCompare(b.label));
        setSearchConfig(prev =>
          prev.map(item =>
            item.key === "province" ? { ...item, options: provinceOptions } : item
          )
        );
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleHistoryPageChange = (page: number) => {
    if (selectedCar) {
      getCarHistory(selectedCar.vehicle.license_id, page);
    }
  };

  const handleLocalSearch = (searchParams: Record<string, any>) => {
    // กรองออก `page` และ `limit` จาก searchParams
    const { page, limit, ...paramsToCheck } = searchParams;

    // ตรวจสอบค่าทุกค่ายกเว้น `page` และ `limit`
    const hasValues = Object.values(paramsToCheck).some(value =>
      value !== undefined && value !== null && value !== ''
    );
    setIsSearch(hasValues);

    // ตรวจสอบ timestamp_in และ timestamp_out ก่อนว่าเป็นค่า valid หรือไม่
    const formattedParams = {
      ...paramsToCheck,
      timestamp_in: paramsToCheck.timestamp_in && paramsToCheck.timestamp_in !== ''
        ? new Date(paramsToCheck.timestamp_in).toISOString()
        : undefined,
      timestamp_out: paramsToCheck.timestamp_out && paramsToCheck.timestamp_out !== ''
        ? new Date(paramsToCheck.timestamp_out).toISOString()
        : undefined
    };

    // ส่งค่าที่ format แล้วไปที่ handleSearch
    handleSearch(formattedParams);
  };

  const handleLocalClear = () => {
    setIsSearch(false);
    handleClear();
    fetchParkingData('AB');
  };

  const renderTableData = () => {
    return logs.data.map((record: ParkingLogItem) => ({
      id: record.vehicle_id,
      license: (
        <div>
          <div className="text-sm font-medium">{record.vehicle.license_id || 'ไม่ระบุ'}</div>
          <div className="text-xs text-gray-500">{record.vehicle.province || "ไม่ระบุ"}</div>
        </div>
      ),
      location: (
        <div>
          <div className="text-sm">ชั้น {record.parkingSlot?.floor}</div>
          <div className="text-xs text-gray-500">
            ลานจอด {record.parkingSlot?.zone} แถว {record.parkingSlot?.row}-
            {record.parkingSlot?.spot}
          </div>
        </div>
      ),
      timeIn: (
        <span className="text-sm">
          {new Date(record.timestamp_in).toLocaleString('en-GB')}
        </span>
      ),
      timeOut: record.timestamp_out ? (
        <span className="text-sm">
          {new Date(record.timestamp_out).toLocaleString('en-GB')}
        </span>
      ) : (
        <span className="text-sm text-gray-500">-</span>
      ),
      rawData: record
    }));
  };

  const renderEmptyMessage = () => {
    if (isSearch) {
      return (
        <div className="p-4">
          <div className=" text-mediumGray mb-2 flex items-start gap-2 justify-center w-full">
            <AlertCircle className='w-5 h-5' />  ไม่พบข้อมูลที่ค้นหา
          </div>
            <div className="text-sm text-gray-400">
              กรุณาลองค้นหาด้วยเงื่อนไขอื่น หรือ
              <button
                onClick={handleClear}
                className="text-primary hover:underline ml-1"
              >
                ล้างการค้นหา
              </button>
            </div>
        </div>
      );
    }
    return 'ไม่พบข้อมูล';
  };

  if (authLoading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumb pageName="ประวัติการใช้งานรถ" />

      <div className="bg-white p-2 rounded w-fit">
        <div className="flex gap-4">
          <button
            onClick={() => handleMapChange('AB')}
            className={`px-4 py-2 rounded-md ${activeMap === 'AB' ? 'bg-primary text-secondary' : 'text-header hover:bg-secondary'}`}
            disabled={loading}
          >
            ลานจอดทั้งหมด
          </button>
          <button
            onClick={() => handleMapChange('A')}
            className={`px-4 py-2 rounded-md ${activeMap === 'A' ? 'bg-primary text-secondary' : 'text-header hover:bg-secondary'}`}
            disabled={loading}
          >
            ลานจอด A
          </button>
          <button
            onClick={() => handleMapChange('B')}
            className={`px-4 py-2 rounded-md ${activeMap === 'B' ? 'bg-primary text-secondary' : 'text-header hover:bg-secondary'}`}
            disabled={loading}
          >
            ลานจอด B
          </button>
        </div>
      </div>

      <div className='bg-white rounded'>
        <SearchDisplay
          searchConfig={searchConfig}
          onSearch={handleLocalSearch}
          onClear={handleLocalClear}
          filters={filters}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className='px-4 pb-4'>
          <div className="flex justify-between items-center pb-4">
            <div className="text-header">
              {isSearch ? `ผลการค้นหา (${logs.meta.total})` : `จำนวนทั้งหมด (${logs.meta.total})`}
            </div>
          </div>

          <div>
            <TableDisplay
              headers={headersConfig}
              data={renderTableData()}
              emptyMessage={renderEmptyMessage()}
              maxHeight="400px"
              rowClassName={() => "hover:bg-gray-50 transition-colors"}
              actions={(item: { rawData: ParkingLogItem }) => (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleCarSelect(item.rawData, 'history')}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="ดูประวัติ"
                    disabled={loading}
                  >
                    <HistoryIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCarSelect(item.rawData, 'info')}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="ดูรายละเอียด"
                    disabled={loading}
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {logs.meta.total > 0 && (
        <Pagination
          currentPage={Number(filters.page) || 1}
          totalPages={Number(logs.meta.totalPages) || 1}
          onPageChange={handlePageChange}
          totalItems={Number(logs.meta.total) || 0}
          itemsPerPage={Number(filters.limit) || 10}
        />
      )}

      {selectedCar && showCarInfoModal && (
        <CarInfoModal
          isOpen={showCarInfoModal}
          onClose={closeModals}
          car={selectedCar}
        />
      )}

      {history && showCarHistoryModal && (
        <CarHistoryModal
          isOpen={showCarHistoryModal}
          onClose={closeModals}
          car={history}
          onPageChange={handleHistoryPageChange}
        />
      )}
    </div>
  );
};

export default ParkingLogPage;