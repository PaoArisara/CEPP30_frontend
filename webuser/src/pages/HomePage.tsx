import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiConfig from '../config/ApiConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ParkingActiveResponse } from '../types/Common';
import TextInput from '../components/common/Input/TextInput';
import SelectInput from '../components/common/Input/SelectInput';

interface FormData {
  License_ID: string;
  Province: { value: string; label: string } | null;
}

interface FormErrors {
  License_ID?: string;
  Province?: string;
}

const LICENSE_MIN_LENGTH = 4;
const LICENSE_MAX_LENGTH = 11;
const THAI_AND_NUMBERS_PATTERN = /^[\u0E00-\u0E7F0-9]*$/;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [provinces, setProvinces] = useState<string[]>([]);

  const savedData = sessionStorage.getItem("licenseData");
  const [formData, setFormData] = useState<FormData>(
    savedData ? JSON.parse(savedData) : { License_ID: '', Province: null }
  );

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json'
      );
      const result = await response.json();
      const provinceNames = result.map((province: any) => province.name_th);
      setProvinces(provinceNames);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setErrors(prev => ({
        ...prev,
        Province: 'ไม่สามารถโหลดข้อมูลจังหวัดได้ กรุณาลองใหม่อีกครั้ง'
      }));
    }
  };

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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'License_ID') {
      const error = validateLicenseID(value);
      setErrors(prev => ({ ...prev, License_ID: error }));
    }
  };

  const handleSelectChange = (selectedOption: { value: string; label: string } | null) => {
    setFormData(prev => ({ ...prev, Province: selectedOption }));
    setErrors(prev => ({ ...prev, Province: undefined }));
  };

  // const handleNotFound = () => {
  //   Swal.fire({
  //     title: `<span class="text-[#42526E] text-lg">ไม่พบข้อมูล</span>`,
  //     html: `
  //           <div class="text-[#42526E] text-sm">
  //               "โปรดกรอกข้อมูลเพิ่มเติม"
  //           </div>
  //       `,
  //     icon: 'error',
  //     iconColor: '#669BBC',  
  //     confirmButtonText: 'ตกลง',
  //     confirmButtonColor: '#0052CC',
  //     customClass: {
  //       confirmButton: 'swal-custom-btn',
  //       popup: 'swal-popup',
  //       title: 'swal-title',
  //       htmlContainer: 'swal-html',
  //       icon: 'swal-icon',  // กำหนด class สำหรับไอคอน
  //     },
  //     width: '300px',
  //   });
  // };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};

    const licenseError = validateLicenseID(formData.License_ID);
    if (licenseError) newErrors.License_ID = licenseError;

    if (!formData.Province) {
      newErrors.Province = 'กรุณาเลือกจังหวัด';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiConfig.get<ParkingActiveResponse>('/parkingrecord-active/searchUser', {
        params: {
          license_id: formData.License_ID,
          province: formData.Province?.value,
          searchMode: 'exact'
        }
      });

      if (response.data.meta.total === 0) {
        // handleNotFound();
        navigate('/option', {
          state: {
            license_id: formData.License_ID,
            province: formData.Province?.value
          }
        });
      } else {
        navigate('/detail', {
          state: { data: response.data.data[0] }
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("licenseData", JSON.stringify(formData));
  }, [formData]);


  if (loading) return <LoadingSpinner />;

  return (
    <div className=" text-header">
      <header className="">
        <h1 className="text-lg font-bold text-center pt-8">
        ค้นหาตำแหน่งรถ
        </h1>
      </header>

        <div className="flex-grow w-full h-52 flex justify-center mt-6 mb-6">
          <img
            src="/src/assets/findCar.svg"
            alt="Find Car"
            className="w-full object-contain rounded"
          />
        </div>

        <div className="space-y-4">
          <TextInput
            require={true}
            label='เลขทะเบียน'
            name='License_ID'
            value={formData.License_ID}
            onChange={handleChange}
            placeholder="กรอกหมายเลขทะเบียน"
            errorMessage={errors.License_ID}
          />

          <SelectInput
            require={true}
            label='จังหวัด'
            options={provinces.map(province => ({
              value: province,
              label: province
            }))}
            value={formData.Province}
            onChange={handleSelectChange}
            placeholder="เลือกจังหวัด"
            errorMessage={errors.Province}
          />
        </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-300">
        <button
          onClick={handleSubmit}
          className={`w-full flex justify-center rounded-full p-2 font-medium bg-primary text-secondary hover:bg-primary/90`}>
          ค้นหา
        </button>
      </div>
    </div>
  );
};

export default HomePage;