import { getImageUrl } from "../../config/ImageConfig";
import { ParkingLogItem } from "../../types/Log";
import { Dialog } from "../dialog/Dialog";
import { DialogContent } from "../dialog/DialogContent";
import { DialogHeader } from "../dialog/DialogHeader";
import { DialogTitle } from "../dialog/DialogTitle";

interface CarInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: ParkingLogItem;
}

export const CarInfoModal: React.FC<CarInfoModalProps> = ({
    isOpen,
    onClose,
    car
}) => {

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
                    <DialogTitle className="text-header">รถทะเบียน {car.vehicle.license_id || "(ไม่ระบุ)"}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 p-4">
                    {car.car_image && (
                        <div className="flex justify-center mb-4">
                            <img 
                                src={getImageUrl(car.car_image)}
                                alt="รูปรถ" 
                                className="max-w-full h-48 object-cover object-bottom rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    {car.license_image && (
                        <div className="flex justify-center mb-4">
                            <img 
                                src={getImageUrl(car.license_image)}
                                alt="ป้ายทะเบียน" 
                                className="max-w-full h-24 object-cover object-bottom rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-mediumGray font-semibold">ทะเบียน</p>
                            <p className="text-header">{car.vehicle.license_id || "ไม่ระบุทะเบียน"} {car.vehicle.province || "(ไม่ระบุจังหวัด)"}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray font-semibold">ยี่ห้อ</p>
                            <p className="text-header">{car.vehicle.vehicle_brand}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray font-semibold">สี</p>
                            <p className="text-header">{car.vehicle.vehicle_color}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray font-semibold">จุดจอดรถ</p>
                            <p className="text-header">ลานจอด {car.parkingSlot?.zone} ชั้น {car.parkingSlot?.floor} แถว {car.parkingSlot?.row} ช่อง {car.parkingSlot?.spot}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray font-semibold">เวลาเข้า</p>
                            <p className="text-header">{new Date(car.timestamp_in).toLocaleString('en-GB')}</p>
                        </div>
                        {car.timestamp_out && (
                            <div>
                                <p className="text-mediumGray font-semibold">เวลาออก</p>
                                <p className="text-header">{new Date(car.timestamp_out).toLocaleString('en-GB')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};