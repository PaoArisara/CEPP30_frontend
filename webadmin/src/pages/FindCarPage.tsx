import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SearchConfig } from '../types/Search';
import Breadcrumb from '../components/layout/Breadcrumb';
import SearchDisplay from '../components/common/SearchDisplay';
import CarInfoDisplay from '../components/common/CarInfoDisplay';
import { Pagination } from '../components/common/Pagination';
import { useFindCar } from '../hooks/useFindCar';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../config/ImageConfig';
import { vehicle_brand } from '../utils/vehicle_brand';
import { vehicle_color } from '../utils/vehicle_color';
import LoadingSpinner from '../components/common/LoadingSpinner';


const FindCarPage: React.FC = () => {

    const [searchConfig, setSearchConfig] = useState<SearchConfig[]>([
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
            header: "เวลาเข้า",
            key: "timestamp_in",
            placeholder: "เลือกเวลา",
            type: "time",
        },
        {
            header: "ยี่ห้อ",
            key: "vehicle_brand",
            placeholder: "เลือกยี่ห้อ",
            type: "select",
            options: vehicle_brand
        },
        {
            header: "สี",
            key: "vehicle_color",
            placeholder: "เลือกสี",
            type: "select",
            options: vehicle_color
        },
    ]);

    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();


    const {
        error,
        activeData,
        filters,
        isSearchMode,
        selectedCar,
        slotData,
        handleSearch,
        handleClear,
        handlePageChange,
        handleClick,
        handleBack,
        loading
    } = useFindCar();


    // Initial auth check
    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch provinces
    useEffect(() => {
        let isMounted = true;
        fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json')
            .then((response) => response.json())
            .then((result) => {
                if (!isMounted) return;
                const provinceOptions = result.map((province: any) => ({
                    label: province.name_th,
                    value: province.name_th
                }));
                setSearchConfig((prevConfig) =>
                    prevConfig.map((item) =>
                        item.header === "จังหวัด" ? { ...item, options: provinceOptions } : item
                    )
                );
            })
            .catch((error) => {
                if (!isMounted) return;
                console.error('Error fetching provinces:', error);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (authLoading || loading) {
        return <LoadingSpinner message="กำลังโหลดข้อมูล..." />;
    }

    return (
        <div className="flex flex-col gap-4 p-4 min-h-screen">
            <div className="flex flex-col gap-4 flex-grow">
                <Breadcrumb pageName="ค้นหาตำแหน่งจอดรถ" />

                {/* Search Section */}
                {!selectedCar && (
                    <SearchDisplay
                        searchConfig={searchConfig}
                        onSearch={handleSearch}
                        onClear={handleClear}
                        filters={filters}
                    />
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-error px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="flex-grow">
                    <div className="flex justify-between items-center pb-4">
                        <div className="text-header">
                            {isSearchMode && !selectedCar
                                ? `ผลการค้นหา (${activeData.meta.total})`
                                : selectedCar ?
                                <>
                                {/* Back Button */}
                                <button
                                    onClick={handleBack}
                                    className="flex items-center text-mediumGray hover:text-primary"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1" />
                                    <span>กลับ</span>
                                </button>
                                </>
                                :`รถที่จอดปัจจุบันทั้งหมด (${activeData.meta.total})`
                            }
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="">
                        {/* List View */}
                        {!selectedCar ? (
                            <div className="">
                                {/* Content */}
                                {activeData.meta.total > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeData.data.map((car) => (
                                            <div
                                                key={car.parking_active_id}
                                                className="bg-white rounded-lg p-5 hover:shadow transition-all cursor-pointer flex flex-col items-center relative group"
                                                onClick={() => handleClick(car)}
                                            >
                                                {/* Car Image */}
                                                <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-200">
                                                    <img
                                                        src={getImageUrl(car.car_image)}
                                                        alt={car.car_image}
                                                        className="w-full h-full object-cover object-bottom transition-transform duration-300"
                                                    />
                                                </div>

                                                {/* Car Info */}
                                                <div className='flex flex-col w-full mt-2'>
                                                    <div>
                                                        <p className="text-lg font-semibold text-header">{car.vehicle.license_id || "ไม่ระบุ"}</p>
                                                        <p className="text-base text-mediumGray">{car.vehicle.province || "ไม่ระบุ"}</p>
                                                    </div>
                                                    {/* Click Indicator */}
                                                    <div className="flex justify-between w-full mt-2">
                                                        <p className="text-sm text-mediumGray">{new Date(car.timestamp_in).toLocaleTimeString('th-TH')}</p>
                                                        <div className='flex gap-2 transition-opacity'>
                                                            <span className="text-sm text-mediumGray group-hover:text-primary">ดูรายละเอียด</span>
                                                            <ChevronRight className='w-5 h-5 text-mediumGray group-hover:text-primary' />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 rounded-lg">
                                        <div className="text-mediumGray mb-2 flex items-start gap-2">
                                          <AlertCircle className='w-5 h-5'/>  {isSearchMode ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีรถในลานจอด'}
                                        </div>
                                        {isSearchMode && (
                                            <div className="text-sm text-gray-400">
                                                กรุณาลองค้นหาด้วยเงื่อนไขอื่น หรือ
                                                <button
                                                    onClick={handleClear}
                                                    className="text-primary hover:underline ml-1"
                                                >
                                                    ล้างการค้นหา
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Detail View
                            <div className="">
                                {/* Car Detail Card */}
                                <CarInfoDisplay
                                    selectedCar={selectedCar}
                                    slotData={slotData}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!selectedCar && activeData.meta.total > 0 && (
                <div className="mt-auto pt-4 sticky bottom-0 bg-gray-50 rounded shadow-md">
                    <Pagination
                        currentPage={Number(filters.page) || 1}
                        totalPages={Number(activeData.meta.lastPage) || 1}
                        onPageChange={handlePageChange}
                        totalItems={Number(activeData.meta.total) || 0}
                        itemsPerPage={Number(filters.limit) || 10}
                    />
                </div>
            )}
        </div>
    );
}

export default FindCarPage;