import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MapDisplay from '../components/common/MapDisplay';
import { CarData } from '../types/Common';
import { getImageUrl } from '../config/ImageConfig';

const DetailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [carData, setCarData] = useState<CarData | null>(null);

  useEffect(() => {
    // Get the data passed from HomePage
    if (location.state && location.state.data) {
      setCarData(location.state.data);
    }
  }, [location]);

  if (loading || !carData) return <LoadingSpinner />;

  // Destructure the necessary fields from carData
  const { vehicle, parkingSlot, car_image, license_image, timestamp_in } = carData;

  return (
    <div className="text-header">
      <header>
        <h1 className="text-lg font-bold text-center pt-8 pb-4">
          จอดตำแหน่ง: {parkingSlot.row}{parkingSlot.spot}
        </h1>
      </header>

      <div className="space-y-4">
        {/* Car Details Section */}
        <section className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-base font-semibold mb-4">รายละเอียดรถของคุณ</h2>
          <div className="flex items-center">
            <img
              src={getImageUrl(car_image)}
              alt="car_image"
              className="w-1/2 h-24 rounded-lg object-cover  object-bottom mr-4"
            />
            {vehicle ? (
              <div>
                <p className="text-sm text-mediumGray">เลขทะเบียน:</p>
                <p className="text-base font-semibold mb-2">{vehicle.license_id}</p>
                <p className="text-sm text-mediumGray">จังหวัด:</p>
                <p className="text-base font-semibold">{vehicle.province}</p>
              </div>
            ) : (
              <div className='w-full justify-center flex'>
                <img
                  src={getImageUrl(license_image)}
                  alt={license_image}
                  className="h-14 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </section>

        {/* Vehicle Info Section */}
        {vehicle && (
          <section className="bg-white p-4 rounded-lg shadow border border-gray-200 flex gap-10">
            <div>
              <p className="text-sm text-mediumGray">สี:</p>
              <p className="text-base font-semibold">
                {vehicle.vehicle_color}
              </p>
            </div>
            <div>
              <p className="text-sm text-mediumGray">ยี่ห้อ:</p>
              <p className="text-base font-semibold">
                {vehicle.vehicle_brand}
              </p>
            </div>
          </section>
        )}

        {/* Timestamp Section */}
        {timestamp_in && (
          <section className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-mediumGray">วันที่และเวลาเข้า:</p>
            <p className="text-base font-semibold">
              {new Date(timestamp_in || '-').toLocaleString('en-GB')}
            </p>
          </section>
        )}

        {/* Parking Location Section */}
        <section className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-md font-semibold mb-2">
            ตำแหน่งจอดรถของคุณ
          </h2>

          <div className="">
            <MapDisplay
              slot={[parkingSlot]}
              map={parkingSlot.zone || ''}
              handleClick={() => { }}
              slotEmpty={null}
              camera={null}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'ลานจอด', value: parkingSlot.zone },
              { label: 'ชั้น', value: parkingSlot.floor },
              { label: 'แถว', value: parkingSlot.row },
              { label: 'ช่อง', value: parkingSlot.spot }
            ].map(item => (
              <div key={item.label}>
                <p className="text-sm text-mediumGray">{item.label}:</p>
                <p className="text-base font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-full bg-primary text-white py-2 px-4 font-medium"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;