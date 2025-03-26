import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiConfig from '../config/ApiConfig';
import { ParkingActiveResponse } from '../types/Common';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SelectInput from '../components/common/Input/SelectInput';
import { Info } from 'lucide-react';
import TimePicker from '../components/common/Input/TimePicker';
import dayjs from 'dayjs';

interface OptionPageState {
  license_id: string;
  province: string;
}

interface FormData {
  license_id: string;
  province: SelectOption | null;
  timestamp_in: dayjs.Dayjs | null; 
  vehicle_brand: SelectOption | null;
  vehicle_color: SelectOption | null;
}

interface SelectOption {
  value: string;
  label: string;
}

interface FormErrors {
  submit?: string;
  form?: string;
  license_id?: string;
  province?: string;
  timestamp_in?: string;
}

const BRANDS = [
  'Toyota',
  'Isuzu',
  'Honda',
  'BYD',
  'Mitsubishi',
  'Ford',
  'MG',
  'Nissan',
  'Mazda',
  'Changan',
  'Tesla',
  'Volvo',
  'BMW',
  'Benz',
  'Hyundai',
];
const COLORS = ['ขาว', 'เทา', 'ดำ', 'เงิน', 'แดง', 'น้ำเงิน', 'เขียว', 'น้ำตาล', 'เบจ'];
const LICENSE_MIN_LENGTH = 4;
const LICENSE_MAX_LENGTH = 11;
const THAI_AND_NUMBERS_PATTERN = /^[\u0E00-\u0E7F0-9]*$/;

const OptionsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const locationState = location.state as OptionPageState | null;

  const [formData, setFormData] = useState<FormData>({
    license_id: locationState?.license_id || '',
    province: locationState?.province ? {
      value: locationState.province,
      label: locationState.province
    } : null,
    timestamp_in: null,
    vehicle_brand: null,
    vehicle_color: null
  });

  const validateLicenseID = (value: string): string | undefined => {
    if (!value) return 'กรุณากรอกหมายเลขทะเบียน';
    if (!THAI_AND_NUMBERS_PATTERN.test(value)) {
      return 'กรุณากรอกภาษาไทยและตัวเลขเท่านั้น';
    }
    if (value.length < LICENSE_MIN_LENGTH) {
      return 'กรุณาใส่หมายเลขทะเบียนที่มีความยาวมากกว่า 4 ตัวอักษร';
    }
    if (value.length > LICENSE_MAX_LENGTH) {
      return 'กรุณาใส่หมายเลขทะเบียนที่มีความยาวไม่เกิน 10 ตัวอักษร';
    }
  };

  const handleSelectChange = (field: keyof FormData) => (
    selectedOption: SelectOption | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOption
    }));
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      form: undefined
    }));
  };

  // เพิ่มฟังก์ชันเพื่อจัดการการเปลี่ยนแปลงเวลา
  const handleTimeChange = (newTime: dayjs.Dayjs | null) => {
    setFormData(prev => ({
      ...prev,
      timestamp_in: newTime
    }));
    setErrors(prev => ({
      ...prev,
      timestamp_in: undefined,
      form: undefined
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const licenseError = validateLicenseID(formData.license_id);
    if (licenseError) {
      newErrors.license_id = licenseError;
    }

    if (!formData.province?.value) {
      newErrors.province = 'กรุณาเลือกจังหวัด';
    }

    // ตรวจสอบว่าเวลาไม่เกินเวลาปัจจุบัน
    if (formData.timestamp_in) {
      const currentTime = dayjs();
      if (
        formData.timestamp_in.hour() > currentTime.hour() ||
        (formData.timestamp_in.hour() === currentTime.hour() && formData.timestamp_in.minute() > currentTime.minute())
      ) {
        newErrors.timestamp_in = 'เวลาต้องไม่เกินเวลาปัจจุบัน';
      }
    }

    const hasAdditionalInfo = formData.timestamp_in ||
      formData.vehicle_brand ||
      formData.vehicle_color;

    if (!hasAdditionalInfo) {
      newErrors.form = 'โปรดกรอกข้อมูลเพิ่มเติมอย่างน้อย 1 ช่อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date();
    let isoTimestamp = '';
    
    if (formData.timestamp_in) {
      const dateWithSelectedTime = new Date(currentDate);
      dateWithSelectedTime.setHours(formData.timestamp_in.hour());
      dateWithSelectedTime.setMinutes(formData.timestamp_in.minute());
      dateWithSelectedTime.setSeconds(formData.timestamp_in.second());
      isoTimestamp = dateWithSelectedTime.toISOString();
    }

    setLoading(true);
    try {
      const response = await ApiConfig.get<ParkingActiveResponse>('/parkingrecord-active/searchUser', {
        params: {
          license_id: formData.license_id,
          province: formData.province?.value,
          timestamp_in: isoTimestamp,
          vehicle_color: formData.vehicle_color?.value || null,
          vehicle_brand: formData.vehicle_brand?.value || null,
          searchMode: 'similar',
          limit: 3,
          page: 1
        }
      });

      if (response.data.meta.total === 0) {
        navigate('/notFound', { state: { formData } });
      } else {
        navigate('/listCar', {
          state: {
            data: response.data,
            filter: formData
          }
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/notFound', { state: { formData } });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!locationState) {
    return <LoadingSpinner />;
  }

  return (
    <div className=" text-header">
      <div className="pt-4 mt-8">
        <div className='flex w-full justify-between'>
          <p className="text-md mb-2 font-bold">ข้อมูลที่ค้นหา</p>
        </div>
        <div className="rounded p-4 border-2 border-secondary space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <p className="">เลขทะเบียน:</p>
            <p className="text-md font-semibold">{formData.license_id}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="">จังหวัด:</p>
            <p className="text-md font-semibold">{formData.province?.value}</p>
          </div>
        </div>

        {!(formData.timestamp_in || formData.vehicle_brand || formData.vehicle_color) ?
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-start gap-2 mt-8">
            <Info className="h-5 w-5 text-yellow-600 mt-1" />
            <div>
              <p className="text-sm text-yellow-800">
                ไม่พบข้อมูลรถ
              </p>
              <p className="text-sm text-yellow-800">
                โปรดกรอกข้อมูลเพิ่มเติม อย่างน้อย 1 รายการ
              </p>
            </div>
          </div> : <div></div>
        }

        <header className="mt-8">
          <h1 className="text-md font-bold text-left">
            ข้อมูลเพิ่มเติม
          </h1>
        </header>

        <div className="space-y-4 mt-4">
          <TimePicker
            label="เลือกเวลาเข้า"
            value={formData.timestamp_in}
            onChange={handleTimeChange}
            placeholder="เลือกเวลาเข้า"
            errorMessage={errors.timestamp_in}
            format="HH:mm"
            views={['hours', 'minutes']}
          />

          <SelectInput
            label="เลือกยี่ห้อ"
            options={BRANDS.map(brand => ({
              value: brand,
              label: brand
            }))}
            value={formData.vehicle_brand}
            onChange={handleSelectChange('vehicle_brand')}
            placeholder="เลือกยี่ห้อ"
          />

          <SelectInput
            label="เลือกสี"
            options={COLORS.map(color => ({
              value: color,
              label: color
            }))}
            value={formData.vehicle_color}
            onChange={handleSelectChange('vehicle_color')}
            placeholder="เลือกสี"
          />
        </div>

        {errors.form && (
          <div className="mt-2 text-red-500 text-sm">
            {errors.form}
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto p-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-white rounded-full p-2 font-medium"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;