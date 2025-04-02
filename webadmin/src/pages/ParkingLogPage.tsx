import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, HistoryIcon as History, SearchIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParkingHistory } from '../hooks/useParkingHistory';
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
    const { page, limit, ...paramsToCheck } = searchParams;

    const hasValues = Object.values(paramsToCheck).some(value =>
      value !== undefined && value !== null && value !== ''
    );
    setIsSearch(hasValues);

    const formattedParams = {
      ...paramsToCheck,
      timestamp_in: paramsToCheck.timestamp_in && paramsToCheck.timestamp_in !== ''
        ? new Date(paramsToCheck.timestamp_in).toISOString()
        : undefined,
      timestamp_out: paramsToCheck.timestamp_out && paramsToCheck.timestamp_out !== ''
        ? new Date(paramsToCheck.timestamp_out).toISOString()
        : undefined
    };

    handleSearch(formattedParams);
  };

  const handleLocalClear = () => {
    setIsSearch(false);
    handleClear();
  };

  const tableHeaders = [
    {
      key: 'license',
      label: 'ทะเบียนรถ',
      render: (record: ParkingLogItem) => (
        <div>
          <div className="text-sm font-medium">{record.vehicle?.license_id || 'ไม่ระบุ'}</div>
          <div className="text-xs text-gray-500">{record.vehicle?.province || "ไม่ระบุ"}</div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'ตำแหน่งจอดรถ',
      render: (record: ParkingLogItem) => (
        <div>
          <div className="text-sm">ชั้น {record.parkingSlot?.floor || 'ไม่ระบุ'}</div>
          <div className="text-xs text-gray-500">
            ลานจอด {record.parkingSlot?.zone || 'ไม่ระบุ'} แถว {record.parkingSlot?.row || 'ไม่ระบุ'}-
            {record.parkingSlot?.spot || 'ไม่ระบุ'}
          </div>
        </div>
      )
    },
    {
      key: 'timeIn',
      label: 'วันที่และเวลาเข้า',
      render: (record: ParkingLogItem) => (
        <span className="text-sm">
          {record.timestamp_in ? new Date(record.timestamp_in).toLocaleString('en-GB') : 'ไม่ระบุ'}
        </span>
      )
    },
    {
      key: 'timeOut',
      label: 'วันที่และเวลาออก',
      render: (record: ParkingLogItem) => (
        record.timestamp_out ? (
          <span className="text-sm">
            {new Date(record.timestamp_out).toLocaleString('en-GB')}
          </span>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )
      )
    }
  ];

  // Actions column
  const renderActions = (record: ParkingLogItem) => (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => handleCarSelect(record, 'history')}
        className="text-gray-600 hover:text-gray-900 transition-colors"
        title="ดูประวัติ"
        disabled={loading}
      >
        <History className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleCarSelect(record, 'info')}
        className="text-gray-600 hover:text-gray-900 transition-colors"
        title="ดูรายละเอียด"
        disabled={loading}
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </div>
  );

  // Row className
  const rowClassName = () => "hover:bg-gray-50 transition-colors";

  const renderEmptyMessage = () => {
    if (loading) {
      return (
        <div className="py-10 flex flex-col items-center justify-center">
          <RefreshCw className="h-10 w-10 text-primary animate-spin mb-3" />
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      );
    }
    
    if (isSearch) {
      return (
        <div className="p-4">
          <div className="text-mediumGray mb-2 flex items-start gap-2 justify-center w-full">
            <AlertCircle className='w-5 h-5' />  ไม่พบข้อมูลที่ค้นหา
          </div>
          <div className="text-sm text-gray-400">
            กรุณาลองค้นหาด้วยเงื่อนไขอื่น หรือ
            <button
              onClick={handleLocalClear}
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
    return <LoadingSpinner message="กำลังตรวจสอบสิทธิ์..." />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      <div className="flex flex-col gap-4 flex-grow">
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 my-2">
              {error}
            </div>
          )}

          <div className='px-4 pb-4'>
            <div className="flex justify-between items-center pb-4">
              <div className="text-header flex items-center">
                {isSearch ? `ผลการค้นหา (${logs?.meta?.total || 0})` : `จำนวนทั้งหมด (${logs?.meta?.total || 0})`}
              </div>
            </div>

            <div>
              <TableDisplay
                headers={tableHeaders}
                data={logs?.data || []}
                actions={renderActions}
                rowClassName={rowClassName}
                emptyMessage={renderEmptyMessage()}
                maxHeight="400px"
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {logs?.meta?.total > 0 && (
        <div className="mt-auto pt-4 sticky bottom-0 bg-gray-50 rounded shadow-md">
          <Pagination
            currentPage={Number(filters.page) || 1}
            totalPages={Number(logs?.meta?.lastPage) || 1}
            onPageChange={handlePageChange}
            totalItems={Number(logs?.meta?.total) || 0}
            itemsPerPage={Number(filters.limit) || 10}
          />
        </div>
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