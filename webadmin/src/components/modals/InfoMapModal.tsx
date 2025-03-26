import React from 'react';
import { X } from 'lucide-react';
import { DialogContent } from '../dialog/DialogContent';
import { Dialog } from '../dialog/Dialog';

interface ParkingLocation {
  name: string;
  description: string;
  directions: string;
  features: string[];
  openHours: string;
  contactNumber: string;
}

type ParkingZone = 'A' | 'B';

const parkingLocations: Record<ParkingZone, ParkingLocation> = {
  'A': {
    name: 'ลานจอดรถ A',
    description: 'ตั้งอยู่บริเวณใต้อาคาร HM (คณะวิศวกรรมศาสตร์)',
    directions: 'เข้าทางประตู 1 เลี้ยวขวาที่แยกแรก',
    features: [
      'ที่จอดรถยนต์ 5 ชั้น',
      'ลิฟต์โดยสาร 2 ตัว',
      'ระบบจอดรถอัตโนมัติ',
      'กล้องวงจรปิดทุกชั้น'
    ],
    openHours: '24 ชั่วโมง',
    contactNumber: '02-222-2222'
  },
  'B': {
    name: 'ลานจอดรถ B',
    description: 'ตั้งอยู่ติดกับอาคารศูนย์อาหาร',
    directions: 'เข้าทางประตู 2 ตรงไปสุดทาง',
    features: [
      'ที่จอดรถยนต์ 3 ชั้น',
      'ลิฟต์โดยสาร 1 ตัว',
      'จุดชาร์จรถยนต์ไฟฟ้า',
      'ห้องน้ำทุกชั้น'
    ],
    openHours: '24 ชั่วโมง',
    contactNumber: '02-333-3333'
  }
};

interface InfoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: string;
}

const InfoMapModal: React.FC<InfoMapModalProps> = ({
  isOpen,
  onClose,
  zone = 'A'
}) => {
  const locationInfo = parkingLocations[zone as ParkingZone] || parkingLocations['A'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="w-full bg-white rounded-lg text-center">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-header">
              {locationInfo.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-mediumGray"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-lg font-medium text-header mb-2">
                รายละเอียดสถานที่
              </h4>
              <p className="text-mediumGray">
                {locationInfo.description}
              </p>
            </div>

            {/* Directions */}
            {/* <div>
              <h4 className="text-lg font-medium text-header mb-2">
                การเดินทาง
              </h4>
              <p className="text-mediumGray">
                {locationInfo.directions}
              </p>
            </div> */}

            {/* Features */}
            {/* <div>
              <h4 className="text-lg font-medium text-header mb-2">
                สิ่งอำนวยความสะดวก
              </h4>
              <ul className="list-disc list-inside text-mediumGray space-y-1">
                {locationInfo.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div> */}

            {/* Operating Hours and Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-medium text-header mb-2">
                  เวลาทำการ
                </h4>
                <p className="text-mediumGray">
                  {locationInfo.openHours}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-header mb-2">
                  ติดต่อเจ้าหน้าที่ประจำตึก
                </h4>
                <p className="text-mediumGray">
                  {locationInfo.contactNumber}
                </p>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoMapModal;