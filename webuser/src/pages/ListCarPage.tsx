import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Alert, AlertDescription } from '../components/common/Alert';
import Swal from 'sweetalert2';
import { getImageUrl } from '../config/ImageConfig';
import ApiConfig from '../config/ApiConfig';
import { Pagination } from '../components/common/Pagination';
import { CarData, FilterData, PaginationMeta, ParkingActiveResponse } from '../types/Common';


const ListCarPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cars, setCars] = useState<CarData[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const filter = location.state?.filter as FilterData;
  const CARS_PER_PAGE = 5;

  useEffect(() => {
    if (!filter) {
      navigate('/', { replace: true });
      return;
    }
    fetchCars(currentPage);
  }, [currentPage, filter]);

  const fetchCars = async (page: number) => {
    setLoading(true);
    try {
      const response = await ApiConfig.get<ParkingActiveResponse>('/parkingrecord-active/searchUser', {
        params: {
          searchMode: 'similar',
          license_id: filter.license_id,
          province: filter.province?.value,
          vehicle_brand: filter.vehicle_brand?.value || null,
          vehicle_color: filter.vehicle_color?.value || null,
          timestamp_in: filter.timestamp_in?.value || null,
          limit: CARS_PER_PAGE,
          page: page
        }
      });

      console.log(response.data.meta);

      setCars(response.data.data);
      setPaginationMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (paginationMeta && page >= 1 && page <= paginationMeta.lastPage) {
      setCurrentPage(page);
    }
  };

  const handleContact = () => {
    Swal.fire({
      title: `<span class="text-[#42526E] text-lg">ติดต่อเจ้าหน้าที่</span>`,
      html: `
               <div class="text-[#42526E] text-sm">
                       ขอความช่วยเหลือเพิ่มเติม
                   </div>
                   <div class="text-[#42526E] text-sm">
                       โทร. 02-111-1111
                   </div>
               `,
      icon: 'info',
      iconColor: '#0052CC',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0052CC',
      customClass: {
        confirmButton: 'swal-custom-btn',
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-html',
      },
      width: '300px',
    });
  };

  if (loading && !cars.length) return <LoadingSpinner />;
  if (!loading && !cars.length) {
    return (
      <div className="p-4 text-center">
        <Alert variant="destructive">
          <AlertDescription>ไม่พบข้อมูลรถ</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-header">
      <header>
        <h1 className="text-lg font-bold text-center pt-8">
          ผลการค้นหา  {paginationMeta?.total ? `(${paginationMeta?.total})` : ''}
        </h1>
      </header>

      {/* Search Filter Details */}
      <div className="mt-4 bg-white p-4 rounded border-2 border-secondary w-full max-w-md mx-auto">
        <div className="space-y-2 text-header">
          <div className="flex w-full justify-between">
            <p>เลขทะเบียน:</p>
            <p className="font-bold text-md">{filter?.license_id || '-'}</p>
          </div>
          <div className="flex w-full justify-between">
            <p>จังหวัด:</p>
            <p className="font-bold text-md">{filter?.province?.label || '-'}</p>
          </div>
          {filter?.timestamp_in && (
            <div className="flex w-full justify-between">
              <p>วันที่และเวลาเข้า:</p>
              <p className="font-bold text-md">{filter.timestamp_in.label}</p>
            </div>
          )}
          {filter?.vehicle_brand && (
            <div className="flex w-full justify-between">
              <p>ยี่ห้อ:</p>
              <p className="font-bold text-md">{filter.vehicle_brand.label}</p>
            </div>
          )}
          {filter?.vehicle_color && (
            <div className="flex w-full justify-between">
              <p>สี:</p>
              <p className="font-bold text-md">{filter.vehicle_color.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Car List */}
      <div className="flex-1 pt-4">
        <div className="space-y-4">
          {cars.map((record: CarData, index) => (
            <div
              key={record.parking_active_id || index} // Ensure `id` is unique; fallback to `index` if necessary
              className='border-2 rounded border-secondary'
              onClick={() => navigate('/detail', { state: { data: record } })}
            >
              <div className='bg-secondary'>
                {record.car_image && (
                  <img
                    src={getImageUrl(record.car_image)}
                    alt="Vehicle"
                    className="h-60 w-full rounded-t"
                  />
                )}
              </div>
              <div className='p-4 space-y-2'>
                <div className='flex w-full justify-between'>
                  <p>ข้อมูลรถ:</p>
                  <div>
                    {record.license_image ? (
                      <img
                        src={getImageUrl(record.license_image)}
                        alt={record.vehicle.license_id}
                        className="h-14 rounded-lg object-contain"
                      />
                    ) : (
                      <p className="font-semibold">{record.vehicle.license_id}</p>
                    )}
                  </div>
                </div>
                <div className='flex w-full justify-between'>
                  <p>วันที่และเวลาเข้า:</p>
                  <p>{new Date(record.timestamp_in).toLocaleString('en-GB')}</p>
                </div>
                <p className='text-right text-primary underline text-sm'>ดูรายละเอียด</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 space-y-2 z-20">
        {paginationMeta && paginationMeta.lastPage > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationMeta.lastPage}
            onPageChange={handlePageChange}
            totalItems={paginationMeta.total}
            itemsPerPage={CARS_PER_PAGE}
            showItemCount={false}
          />
        )}
        <button
          onClick={handleContact}
          className="w-full text-sm text-mediumGray pt-2"
        >
          ติดต่อเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
};

export default ListCarPage;