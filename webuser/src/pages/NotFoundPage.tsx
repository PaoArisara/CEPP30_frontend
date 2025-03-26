import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const formData = location.state?.formData;

    const getDisplayValue = (field: { label: string; }) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field.label || '';
    };

    const handleSubmit = () => {
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

    return (
        <div className="text-header">
            <header className="">
                <h1 className="text-lg font-bold text-center text-header pt-8">
                    ไม่พบข้อมูลรถ
                </h1>
            </header>

            <div className="container mx-auto">
                <div className="mb-6 text-center">
                    {/* <p className="text-error text-lg font-semibold">ไม่พบข้อมูลรถ</p> */}
                    <p className="text-sm mt-2 text-mediumGray">ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ</p>

                    <div className='mt-6 flex justify-center'>
                        <img
                            src="/src/assets/notFound.svg"
                            alt="Car not found"
                            className="w-full max-w-md h-52 object-contain rounded"
                        />
                    </div>

                    {formData && (
                        <div className="bg-white rounded p-4 border-2 border-secondary">
                            <h2 className="text-lg font-semibold mb-4">ข้อมูลที่ค้นหา</h2>
                            <div className="space-y-2">
                                {formData.license_id && (
                                    <div className="flex justify-between items-center">
                                        <span className="">เลขทะเบียน:</span>
                                        <span className="font-medium">{formData.license_id}</span>
                                    </div>
                                )}
                                {formData.province && (
                                    <div className="flex justify-between items-center">
                                        <span className="">จังหวัด:</span>
                                        <span className="font-medium">{getDisplayValue(formData.province)}</span>
                                    </div>
                                )}
                                {formData.timestamp_in && (
                                    <div className="flex justify-between items-center">
                                        <span className="">วันที่และเวลาเข้า:</span>
                                        <span className="font-medium">{getDisplayValue(formData.timestamp_in)}</span>
                                    </div>
                                )}
                                {formData.vehicle_brand && (
                                    <div className="flex justify-between items-center">
                                        <span className="">ยี่ห้อ:</span>
                                        <span className="font-medium">{getDisplayValue(formData.vehicle_brand)}</span>
                                    </div>
                                )}
                                {formData.vehicle_color && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">สี:</span>
                                        <span className="font-medium">{getDisplayValue(formData.vehicle_color)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div onClick={() => navigate(-1)} className="mt-4 text-sm text-mediumGray underline cursor-pointer">ทำการค้นหาอีกครั้ง</div>
                </div>

                {/* Fixed Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 space-y-2 z-20">
                    <button
                        onClick={handleSubmit}
                        className="w-full flex justify-center rounded-full bg-primary text-white p-2 font-medium"
                    >
                        ติดต่อเจ้าหน้าที่
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full text-sm text-mediumGray py-2"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;