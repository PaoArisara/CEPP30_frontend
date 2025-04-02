import React, { useEffect, useState } from 'react';
import { searchConfig, statusColors, useCamera } from "../hooks/useCamera";
import { Camera, CameraStatus } from "../types/Camera";
import { MaintenanceModal } from '../components/modals/MaintenanceModal';
import { TableDisplay } from '../components/common/TableDisplay';
import { AlertCircle, History, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '../components/common/Alert';
import SearchDisplay from '../components/common/SearchDisplay';
import Breadcrumb from '../components/layout/Breadcrumb';
import { SearchFields } from '../types/Search';
import { Pagination } from '../components/common/Pagination';
import { HistoryModal } from '../components/modals/HistoryModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';


const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    loading,
    error,
    cameras,
    filters,
    activeTab,
    selectedCamera,
    showHistoryModal,
    showMaintenanceModal,
    handleSearch,
    handlePageChange,
    handleClear,
    handleTabChange,
    handleStatusUpdate,
    handleModalControl,
    closeModals,
    historyLoading,
    historyError,
    history,
    isSearch,
    getHistory
  } = useCamera();

  // Initial auth check
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // State for maintenance confirmation
  const [maintenanceCamera, setMaintenanceCamera] = useState<Camera | null>(null);

  const searchFilters: SearchFields = {
    camera_id: filters.camera_id,
    floor: filters.floor,
    zone: filters.zone,
    status: filters.status,
  };


  // Confirm maintenance
  const handleConfirmMaintenance = (camera: Camera, newStatus: CameraStatus, note?: string) => {
    handleStatusUpdate({
      camera_id: camera.camera_id,
      status: newStatus,
      note
    });
    setMaintenanceCamera(null);
  };

  // Table headers configuration
  const tableHeaders = [
    {
      key: 'camera_id',
      label: 'รหัสกล้อง',
      render: (camera: { camera_id: string }) => (
        <p className="whitespace-nowrap text-sm">{camera.camera_id}</p>
      )
    },
    {
      key: 'location',
      label: 'ตำแหน่ง',
      render: (camera: { floor: string, zone: string, row: string, spot: string }) => camera.floor ? (
        <>
          <div className="text-sm">ชั้น {camera.floor}</div>
          <div className="text-xs text-mediumGray">
            ลานจอด {camera.zone}, ช่องจอด {camera.row}-{camera.spot}
          </div>
        </>
      ) : (
        <div className="text-sm text-mediumGray">ไม่มีตำแหน่ง</div>
      )
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (camera: { status: CameraStatus }) => (
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[camera.status]}`}>
          {camera.status}
        </span>
      )
    },
    {
      key: 'lastStatusChange',
      label: 'อัปเดตล่าสุด',
      render: (camera: { lastStatusChange: string }) => new Date(camera.lastStatusChange).toLocaleString('en-GB')
    }
  ];

  // Actions column
  const renderActions = (camera: Camera) => (
    <div className="flex gap-2 justify-center items-center">
      <button
        onClick={() => handleModalControl('history', camera)}
        className="text-header hover:text-gray-900"
        title="ดูประวัติ"
        disabled={loading}
      >
        <History className="h-5 w-5" />
      </button>
      {camera.status === "ชำรุด" && (
        <button
          onClick={() => setMaintenanceCamera(camera)}
          className="text-error hover:text-red-900"
          title="แจ้งซ่อม"
          disabled={loading}
        >
          <Wrench className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  // Row className for status-based coloring
  const rowClassName = (item: Camera) => `
    hover:bg-gray-50 transition-colors 
    ${item.status === "ชำรุด" ? "bg-red-50" : ""}
  `;

  const renderEmptyMessage = () => {
    if (isSearch) {
      return (
        <div className="p-4">
          <div className="text-mediumGray mb-2 flex items-start gap-2 justify-center w-full">
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
    return <LoadingSpinner message="กำลังตรวจสอบสิทธิ์..." />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      {/* Content wrapper - flex-grow to push pagination to bottom */}
      <div className="flex flex-col gap-4 flex-grow">
        <Breadcrumb pageName="ระบบจัดการกล้องวงจรปิด" />

        {/* Status Filters */}
        <div className="bg-white p-2 rounded w-fit">
          <div className="flex gap-4">
            {[
              { key: 'all', label: 'ทั้งหมด', activeClass: 'bg-primary text-secondary hover:bg-primaryContrast' },
              { key: 'active', label: 'ปกติ', activeClass: 'bg-primary text-secondary hover:bg-primaryContrast' },
              {
                key: 'waiting',
                label: 'รอดำเนินการ',
                activeClass: 'bg-primary text-secondary hover:bg-primaryContrast',
              },
              {
                key: 'broken',
                label: 'กล้องชำรุด',
                activeClass: 'bg-primary text-secondary hover:bg-primaryContrast',
              }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  activeTab === tab.key ? tab.activeClass : 'text-header hover:bg-secondary'
                }`}
                disabled={loading}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='bg-white rounded'>
          {/* Search */}
          <SearchDisplay
            searchConfig={searchConfig}
            onSearch={handleSearch}
            onClear={handleClear}
            filters={searchFilters}
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='px-4 pb-4'>
            <div className="flex justify-between items-center pb-4">
              <div className="text-header">
                {isSearch ? `ผลการค้นหา (${cameras.meta.total})` : `จำนวนทั้งหมด (${cameras.meta.total})`}
              </div>
            </div>
            
            <TableDisplay
              headers={tableHeaders}
              data={cameras.data}
              actions={renderActions}
              rowClassName={rowClassName}
              emptyMessage={renderEmptyMessage()}
              maxHeight="400px"
              loading={loading} 
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 sticky bottom-0 bg-gray-50">
        <Pagination
          currentPage={Number(filters.page) || 1}
          totalPages={Number(cameras.meta.lastPage) || 1}
          onPageChange={handlePageChange}
          totalItems={Number(cameras.meta.total) || 0}
          itemsPerPage={Number(filters.limit) || 10}
        />
      </div>

      {/* Maintenance Modal */}
      {maintenanceCamera && (
        <MaintenanceModal
          isOpen={!!maintenanceCamera}
          onClose={() => setMaintenanceCamera(null)}
          camera={maintenanceCamera}
          onSubmit={handleConfirmMaintenance}
        />
      )}

      {/* Existing Modals */}
      {selectedCamera && (
        <>
          {showHistoryModal && (
            <HistoryModal
              camera={selectedCamera}
              isOpen={showHistoryModal}
              onClose={closeModals}
              loading={historyLoading}
              error={historyError}
              history={history}
              onPageChange={(page) => getHistory(selectedCamera.camera_id, page)}
            />
          )}

          {showMaintenanceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded">
                <h2 className="text-xl font-bold mb-4">แจ้งซ่อมกล้อง</h2>
                <p>รายละเอียดการแจ้งซ่อม...</p>
                <button
                  onClick={closeModals}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraPage;