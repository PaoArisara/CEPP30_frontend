import React from 'react';
import { Camera, HistoryResponse } from '../../types/Camera';
import { Pagination } from '../common/Pagination';
import { Dialog } from '../dialog/Dialog';
import { DialogContent } from '../dialog/DialogContent';
import { DialogHeader } from '../dialog/DialogHeader';
import { DialogTitle } from '../dialog/DialogTitle';

interface HistoryModalProps {
    camera: Camera;
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    error: string | null;
    history: HistoryResponse;
    onPageChange: (page: number) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
    camera,
    isOpen,
    onClose,
    loading,
    history,
    onPageChange
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ปกติ':
                return 'text-green-600';
            case 'ชำรุด':
                return 'text-red-600';
            case 'รอดำเนินการ':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getActionText = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'สร้าง';
            case 'UPDATE_STATUS':
                return 'อัพเดทสถานะ';
            default:
                return action;
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                    >
                        ✕
                    </button>
                    <DialogTitle className="text-header">ประวัติกล้อง {camera.camera_id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 h-96 overflow-y-auto p-4">
                    {history.data.map((record) => (
                        <div key={record.camera_history_id} className="border rounded-lg p-4 bg-white shadow">
                            <div className="flex justify-between">
                                <span className="text-sm text-mediumGray">
                                    วันที่ {new Date(record.event_time).toLocaleString('en-GB')}
                                </span>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className='text-header'>ตำแหน่ง:</strong>{' '}
                                <p className='text-mediumGray'>
                                    ลานจอด {camera.zone} ชั้น {camera.floor} แถว {camera.row} ช่อง {camera.spot}
                                </p>
                            </div>
                            <div className="text-sm mt-2">
                                <strong className='text-header'>การดำเนินการ:</strong> <span className='text-mediumGray'>{getActionText(record.action)}</span>
                                {record.old_status && record.new_status && (
                                    <span>
                                        <strong className='text-mediumGray'> → </strong>
                                        <span className='text-mediumGray'>จาก</span> <span className={getStatusColor(record.old_status)}>{record.old_status}</span>
                                        {' '}<span className='text-mediumGray'>เป็น</span>{' '}
                                        <span className={getStatusColor(record.new_status)}>{record.new_status}</span>
                                    </span>
                                )}
                            </div>
                            {record.changed_by && (
                                <div className="text-sm mt-2">
                                    <strong className='text-header'>ดำเนินการโดย:</strong> <p className='text-mediumGray'>{record.changed_by === '00000000-0000-0000-0000-000000000000' ? 'system' : record.changed_by}</p>
                                </div>
                            )}
                            {record.note && (
                                <div className="text-sm mt-2">
                                    <strong className='text-header'>หมายเหตุ:</strong> <p className='text-mediumGray'>{record.note}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!loading && history.meta.lastPage > 1 && (
                    <div className="mt-4 border-t pt-4">
                        <Pagination
                            currentPage={history.meta.page}
                            totalPages={history.meta.lastPage}
                            onPageChange={onPageChange}
                            totalItems={history.meta.total}
                            itemsPerPage={history.meta.limit}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog >
    );
};