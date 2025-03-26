import { CarData } from '../../types/Active';
import { Slot } from '../../types/Slot';
import MapDisplay from './MapDisplay'
import { getImageUrl } from '../../config/ImageConfig';

interface CarInfoDisplayProps {
    selectedCar: CarData;
    slotData: Slot;
}

function CarInfoDisplay({ selectedCar, slotData }: CarInfoDisplayProps) {
    console.log('slotdata',slotData);
    const mapZone = slotData.zone ? slotData.zone : 'A';
    console.log(mapZone);
    

    return (
        <div className="bg-white rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-4">
                    <img
                        src={getImageUrl(selectedCar.car_image)}
                        alt="Car"
                        className="w-full rounded h-40 object-contain border-secondary border"
                    />
                    <img
                        src={getImageUrl(selectedCar.license_image)}
                        alt="License plate"
                        className="w-full rounded h-32 object-contain border-secondary border"
                    />
                </div>

                {/* Info */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold text-header">
                            {selectedCar.vehicle.license_id}
                        </h3>
                        <p className="text-mediumGray">{selectedCar.vehicle.province}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-mediumGray">ยี่ห้อ</p>
                            <p className="font-medium text-header">{selectedCar.vehicle.vehicle_brand}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray">สี</p>
                            <p className="font-medium text-header">{selectedCar.vehicle.vehicle_color}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray">ลานจอด</p>
                            <p className="font-medium text-header">{selectedCar.parkingSlot.zone}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray">ชั้น</p>
                            <p className="font-medium text-header">{selectedCar.parkingSlot.floor}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray">แถว</p>
                            <p className="font-medium text-header">{selectedCar.parkingSlot.row}</p>
                        </div>
                        <div>
                            <p className="text-mediumGray">ช่อง</p>
                            <p className="font-medium text-header">{selectedCar.parkingSlot.spot}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-mediumGray">วันที่และเวลาเข้า</p>
                        <p className="font-medium text-header">
                            {new Date(selectedCar.timestamp_in).toLocaleString('en-GB')}
                        </p>
                    </div>
                </div>
            </div>
            {/* Map Display */}
            {mapZone && (
                <div className="bg-white rounded p-6 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-header">ตำแหน่งจอดรถ</h3>
                    <MapDisplay
                        slot={[slotData]}
                        map={mapZone}
                        handleClick={() => { }}
                        slotEmpty={null}
                        camera={null}
                    />
                </div>
            )}
        </div>
    )
}

export default CarInfoDisplay