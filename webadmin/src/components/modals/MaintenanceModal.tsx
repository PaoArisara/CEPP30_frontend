import React, { useState } from 'react';
import { Camera, CameraStatus } from '../../types/Camera';
import { Dialog } from '../dialog/Dialog';
import { DialogContent } from '../dialog/DialogContent';
import { DialogHeader } from '../dialog/DialogHeader';
import { DialogTitle } from '../dialog/DialogTitle';
import { AlertTriangle, Info } from 'lucide-react';

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    camera: Camera;
    onSubmit: (camera: Camera, newStatus: CameraStatus, note?: string) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
    isOpen,
    onClose,
    camera,
    onSubmit
}) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate confirm text
        if (confirmText.trim().toLowerCase() !== 'ยืนยัน') {
            setError('กรุณาพิมพ์ "ยืนยัน" เพื่อยืนยันการแจ้งซ่อม');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Direct call with camera, status, and optional note
            onSubmit(camera, 'รอดำเนินการ', note);

            setConfirmText('');
            setNote('');
            onClose();
        } catch (error) {
            console.error('Error submitting maintenance request:', error);
            setError('เกิดข้อผิดพลาดในการส่งคำร้อง กรุณาลองอีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        // Reset all states when closing
        setConfirmText('');
        setNote('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleModalClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        แจ้งซ่อมกล้อง {camera.camera_id}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    {/* Camera Details */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-start gap-2">
                        <Info className="h-5 w-5 text-yellow-600 mt-1" />
                        <div>
                            <p className="text-sm text-yellow-800">
                                ตำแหน่งกล้อง: ชั้น {camera.floor} ลานจอด {camera.zone} ช่องจอด {camera.row}-{camera.spot}
                            </p>
                            <p className="text-sm text-yellow-800">
                                สถานะปัจจุบัน: {camera.status}
                            </p>
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            หมายเหตุเพิ่มเติม (ถ้ามี)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full rounded-md border p-2 min-h-[100px]"
                            placeholder="กรอกรายละเอียดปัญหาที่พบ (ถ้ามี)"
                        />
                    </div>

                    {/* Confirmation Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            กรุณาพิมพ์ "ยืนยัน" เพื่อติดต่อเจ้าหน้าที่
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="ระบุ ยืนยัน"
                            className={`mt-1 block w-full rounded-md border p-2 ${error ? 'border-red-500' : ''
                                }`}
                            value={confirmText}
                            onChange={(e) => {
                                setConfirmText(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === ' ') {
                                    e.preventDefault(); // ป้องกัน Spacebar
                                }
                            }}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={handleModalClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={confirmText.trim().toLowerCase() !== 'ยืนยัน' || loading}
                            className={`px-4 py-2 rounded-md text-white transition-colors ${confirmText.trim().toLowerCase() === 'ยืนยัน' && !loading
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'กำลังส่ง...' : 'แจ้งซ่อม'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};