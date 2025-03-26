import React from 'react';
import { X } from 'lucide-react';
import { Dialog } from '../dialog/Dialog';
import { DialogContent } from '../dialog/DialogContent';
import { DialogHeader } from '../dialog/DialogHeader';
import { DialogTitle } from '../dialog/DialogTitle';
import { Pagination } from '../common/Pagination';
import { HistoryResponse } from '../../types/Log';

interface CarHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: HistoryResponse;
    onPageChange?: (page: number) => void;
}

export const CarHistoryModal: React.FC<CarHistoryModalProps> = ({
    isOpen,
    onClose,
    car,
    onPageChange
}) => {
    if (!car) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-mediumGray hover:text-gray-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <DialogTitle className="text-xl font-semibold">ประวัติการจอดรถ</DialogTitle>
                        <div className="mt-2">
                            <p className="text-mediumGray">ไม่พบข้อมูล</p>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-mediumGray hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <DialogTitle className="text-xl font-semibold text-header">ประวัติการจอดรถ</DialogTitle>
                </DialogHeader>

                <div className="px-4 mt-2">
                    <p className="text-lg font-medium text-header">{car.carInfo.vehicle.license_id || "ไม่ระบุทะเบียน"} ({car.carInfo.vehicle.province || "ไม่ระบุจังหวัด"})</p>
                    <p className="text-mediumGray text-sm">
                        จอดทั้งหมด {car.carInfo.totalParkings} ครั้ง • เฉลี่ย {car.carInfo.averageParkingTime}
                    </p>
                </div>
                <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
                    {car.parkingHistory.length > 0 ? (
                        car.parkingHistory.map((record, index) => (
                            <div
                                key={`${record.parkingSlot.row}-${record.timestamp_in}`}
                                className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-header">ครั้งที่ {index + 1 + ((car.meta.page - 1) * car.meta.limit)}</span>
                                    <span className="text-sm text-lightGray">
                                        ช่องจอด {record.parkingSlot.parking_id}
                                    </span>
                                </div>

                                <div className="mt-2 space-y-1">
                                    <div className="text-sm">
                                        <span className="font-medium text-header">เวลาเข้า:</span>{' '}
                                        <span className='text-mediumGray'>{new Date(record.timestamp_in).toLocaleString('en-GB')}</span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium text-header">เวลาออก:</span>{' '}
                                        <span className='text-mediumGray'>{record.timestamp_out ? new Date(record.timestamp_out).toLocaleString('en-GB') : '-'}</span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium text-header">ระยะเวลาจอด:</span>{' '}
                                        <span className="text-primary">{record.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            ไม่พบประวัติการจอดรถ
                        </div>
                    )}
                </div>

                {car.meta.totalPages > 1 && onPageChange && (
                    <div className="mt-4 border-t pt-4">
                        <Pagination
                            currentPage={car.meta.page}
                            totalPages={car.meta.totalPages}
                            onPageChange={onPageChange}
                            totalItems={car.meta.total}
                            itemsPerPage={car.meta.limit}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CarHistoryModal;