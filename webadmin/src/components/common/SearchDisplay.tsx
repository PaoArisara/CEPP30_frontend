import React, { useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import 'dayjs/locale/th';
import dayjs from 'dayjs';
import { InternalFormData, ProcessedFilters, SearchDisplayProps, SearchOption } from '../../types/Search';
import { X } from 'lucide-react';

// ค่าคงที่สำหรับการตรวจสอบเลขทะเบียน
const THAI_AND_NUMBERS_PATTERN = /^[ก-๙0-9\s]+$/;
const LICENSE_MIN_LENGTH = 2;
const LICENSE_MAX_LENGTH = 10;

const SearchDisplay: React.FC<SearchDisplayProps> = ({ searchConfig, onSearch, onClear, filters }) => {
    const initialFormData: InternalFormData = Object.entries(filters).reduce((acc, [key, value]) => {
        const config = searchConfig.find(c => c.key === key);

        if ((config?.type === 'dateTime' || config?.type === 'time' || config?.type === 'date') && value) {
            acc[key] = dayjs(value);
        } else if ((config?.type === 'dateTime' || config?.type === 'time' || config?.type === 'date') && !value) {
            acc[key] = null;
        } else if (typeof value === 'number') {
            acc[key] = value.toString();
        } else {
            acc[key] = value as string | null | undefined;
        }
        return acc;
    }, {} as InternalFormData);

    const [formData, setFormData] = useState(initialFormData);
    const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
    const [licenseError, setLicenseError] = useState('');
    const [showLicenseError, setShowLicenseError] = useState(false);
    const [showDateErrors, setShowDateErrors] = useState<Record<string, boolean>>({});
    const [isFormValid, setIsFormValid] = useState(true);

    useEffect(() => {
        const updatedFormData = Object.entries(filters).reduce((acc, [key, value]) => {
            const config = searchConfig.find(c => c.key === key);

            if ((config?.type === 'dateTime' || config?.type === 'time' || config?.type === 'date') && value) {
                acc[key] = dayjs(value);
            } else if ((config?.type === 'dateTime' || config?.type === 'time' || config?.type === 'date') && !value) {
                acc[key] = null;
            } else if (typeof value === 'number') {
                acc[key] = value.toString();
            } else {
                acc[key] = value as string | null | undefined;
            }
            return acc;
        }, {} as InternalFormData);

        setFormData(updatedFormData);
    }, [filters, searchConfig]);

    // ตรวจสอบความถูกต้องของฟอร์มเมื่อมีการเปลี่ยนแปลงข้อมูล
    useEffect(() => {
        const licenseValue = formData.license_id as string;
        const hasLicenseError = licenseValue ? !!validateLicenseID(licenseValue) : false;

        // ตรวจสอบว่ามี error ในฟิลด์วันที่หรือไม่
        const hasDateErrors = Object.values(dateErrors).some(error => error !== '');

        setIsFormValid(!hasLicenseError && !hasDateErrors);
    }, [formData, dateErrors]);

    // ฟังก์ชันตรวจสอบเลขทะเบียน
    const validateLicenseID = (value: string): string | undefined => {
        if (!value) return 'กรุณากรอกหมายเลขทะเบียน';
        if (!THAI_AND_NUMBERS_PATTERN.test(value)) {
            return 'กรุณากรอกภาษาไทยและตัวเลขเท่านั้น';
        }
        if (value.length < LICENSE_MIN_LENGTH) {
            return `กรุณากรอกอย่างน้อย ${LICENSE_MIN_LENGTH} ตัวอักษร`;
        }
        if (value.length > LICENSE_MAX_LENGTH) {
            return `กรุณาใส่หมายเลขทะเบียนที่มีความยาวไม่เกิน ${LICENSE_MAX_LENGTH} ตัวอักษร`;
        }
        return undefined;
    };

    // ฟังก์ชันตรวจสอบรูปแบบวันที่
    const validateDateFormat = (value: any, type: string, key: string): string => {
        if (!value) return '';

        if (type === 'date' && !dayjs(value).isValid()) {
            return 'รูปแบบวันที่ไม่ถูกต้อง';
        }

        if (type === 'dateTime' && !dayjs(value).isValid()) {
            return 'รูปแบบวันที่และเวลาไม่ถูกต้อง';
        }

        if (type === 'time' && !dayjs(value).isValid()) {
            return 'รูปแบบเวลาไม่ถูกต้อง';
        }

        const now = dayjs();

        // ตรวจสอบเวลาไม่เกินปัจจุบัน สำหรับ time
        if (type === 'time') {
            // สร้างวันที่ปัจจุบันพร้อมเวลาจาก input
            const inputTime = dayjs(value);
            const currentTime = dayjs();

            // เปรียบเทียบเฉพาะเวลาโดยไม่สนใจวันที่
            if (
                inputTime.hour() > currentTime.hour() ||
                (inputTime.hour() === currentTime.hour() && inputTime.minute() > currentTime.minute()) ||
                (inputTime.hour() === currentTime.hour() && inputTime.minute() === currentTime.minute() && inputTime.second() > currentTime.second())
            ) {
                return 'เวลาต้องไม่เกินเวลาปัจจุบัน';
            }
        }

        // ตรวจสอบวันเวลาไม่เกินปัจจุบัน สำหรับ dateTime
        if (type === 'dateTime' && dayjs(value).isAfter(now)) {
            return 'วันที่และเวลาต้องไม่เกินปัจจุบัน';
        }

        // ตรวจสอบเงื่อนไขเฉพาะของแต่ละฟิลด์
        if (key === 'timestamp_in' && dayjs(value).isAfter(now)) {
            return 'วันที่เข้าต้องไม่เกินวันที่ปัจจุบัน';
        }

        // ตรวจสอบความสัมพันธ์ระหว่าง timestamp_in และ timestamp_out
        if (key === 'timestamp_out') {
            const timestamp_in = formData.timestamp_in;
            if (timestamp_in && dayjs(value).isBefore(timestamp_in)) {
                return 'วันที่ออกต้องไม่ก่อนวันที่เข้า';
            }
        }

        return '';
    };

    const validateDates = () => {
        let isValid = true;
        const newErrors = { ...dateErrors };

        // ตรวจสอบทุกฟิลด์ที่เป็นวันที่หรือเวลา
        searchConfig.forEach(config => {
            if (['date', 'dateTime', 'time'].includes(config.type)) {
                const value = formData[config.key];
                if (value) {
                    const error = validateDateFormat(value, config.type, config.key);
                    newErrors[config.key] = error;
                    if (error) isValid = false;
                }
            }
        });

        setDateErrors(newErrors);
        return isValid;
    };

    const handleSearch = () => {
        // ตรวจสอบเลขทะเบียนเมื่อกดปุ่มค้นหา
        const licenseValue = formData.license_id as string;
        if (licenseValue) {
            const licenseErrorMsg = validateLicenseID(licenseValue);
            if (licenseErrorMsg) {
                setLicenseError(licenseErrorMsg);
                setShowLicenseError(true);
                return;
            }
        }

        // ตรวจสอบวันที่
        if (!validateDates()) {
            return;
        }

        // ถ้าผ่านการตรวจสอบทั้งหมด ส่งข้อมูลไป search
        const processedFormData: ProcessedFilters = Object.entries(formData).reduce((acc, [key, value]) => {
            if (value === undefined || value === '') return acc;
            acc[key] = dayjs.isDayjs(value) ? value.toISOString() : value;
            return acc;
        }, {} as ProcessedFilters);

        onSearch(processedFormData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        // ถ้าเป็น license_id และมีภาษาอังกฤษ ไม่อัพเดทค่า
        if (key === 'license_id' && /[a-zA-Z]/.test(value)) {
            const error = 'กรุณากรอกภาษาไทยและตัวเลขเท่านั้น';
            setLicenseError(error);
            setShowLicenseError(true);
            return;
        }

        setFormData(prev => ({ ...prev, [key]: value }));

        // ตรวจสอบเลขทะเบียนเมื่อมีการพิมพ์
        if (key === 'license_id') {
            if (value) {
                const error = validateLicenseID(value);
                setLicenseError(error || '');
                setShowLicenseError(!!error);
            } else {
                setLicenseError('');
                setShowLicenseError(false);
            }
        }
    };

    const handleClearInput = (key: string) => {
        setFormData(prev => ({ ...prev, [key]: '' }));
        if (key === 'license_id') {
            setLicenseError('');
            setShowLicenseError(false);
        } else if (dateErrors[key]) {
            setDateErrors(prev => ({ ...prev, [key]: '' }));
            setShowDateErrors(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleSelectChange = (selectedOption: SingleValue<SearchOption>, key: string) => {
        setFormData(prev => ({ ...prev, [key]: selectedOption ? selectedOption.value : null }));
    };

    const handleDateTimeChange = (value: dayjs.Dayjs | null, key: string, type: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));

        // ตรวจสอบรูปแบบวันที่เมื่อมีการเปลี่ยนแปลง
        if (value) {
            const error = validateDateFormat(value, type, key);
            setDateErrors(prev => ({ ...prev, [key]: error }));
            setShowDateErrors(prev => ({ ...prev, [key]: !!error }));
        } else {
            setDateErrors(prev => ({ ...prev, [key]: '' }));
            setShowDateErrors(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleClear = () => {
        setFormData({});
        setDateErrors({});
        setShowDateErrors({});
        setLicenseError('');
        setShowLicenseError(false);
        setIsFormValid(true);
        onClear();
    };

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderColor: state.isFocused ? '#0052CC' : '#E9F2FF',
            borderWidth: '2px',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            boxShadow: 'none',
            minHeight: '40px',
            height: '40px',
            '&:hover': {
                borderColor: state.isFocused ? '#0052CC' : '#BFC3C7'
            }
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            height: '38px',
            padding: '0 6px'
        }),
        input: (provided: any) => ({
            ...provided,
            margin: '0px'
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#BFC3C7',
            fontSize: '14px',
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    const renderInput = (config: any) => {
        switch (config.type) {
            case "text":
                return (
                    <div className="relative">
                        <div
                            className="relative"
                            onMouseEnter={() => config.key === 'license_id' && licenseError ? setShowLicenseError(true) : null}
                            onMouseLeave={() => config.key === 'license_id' ? setShowLicenseError(false) : null}
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={config.placeholder}
                                    className={`border-2 ${config.key === 'license_id' && licenseError ? 'border-red-500 focus:border-red-500' : 'border-secondary focus:border-primary'} placeholder:text-lightGray hover:border-lightGray w-full rounded py-2 px-2 text-sm outline-none ${formData[config.key] ? 'pr-8' : ''}`}
                                    value={formData[config.key] as string || ''}
                                    onChange={(e) => handleInputChange(e, config.key)}
                                />
                                {formData[config.key] && (
                                    <button
                                        className="absolute right-2 top-3 text-lightGray hover:text-gray-500"
                                        onClick={() => handleClearInput(config.key)}
                                        type="button"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {config.key === 'license_id' && showLicenseError && licenseError && (
                            <div className="absolute z-10 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mt-1 shadow-sm w-full">
                                {licenseError}
                            </div>
                        )}
                    </div>
                );
            case "select":
                return (
                    <Select
                        options={config.options || []}
                        placeholder={config.options?.length ? config.placeholder : "Loading..."}
                        styles={customStyles}
                        value={config.options?.find((opt: any) => opt.value === formData[config.key]) || null}
                        onChange={(option) => handleSelectChange(option, config.key)}
                        isClearable
                        isDisabled={!config.options || config.options.length === 0}
                    />
                );
            case "dateTime":
                const now = dayjs();
                const isTimestampOut = config.key === 'timestamp_out';
                const timestampIn = formData.timestamp_in as dayjs.Dayjs | null;
                return (
                    <div>
                        <div
                            className="relative"
                            onMouseEnter={() => dateErrors[config.key] ? setShowDateErrors(prev => ({ ...prev, [config.key]: true })) : null}
                            onMouseLeave={() => setShowDateErrors(prev => ({ ...prev, [config.key]: false }))}
                        >
                            <div className="relative">
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                    <DateTimePicker
                                        value={dayjs.isDayjs(formData[config.key]) ? formData[config.key] as dayjs.Dayjs : null}
                                        onChange={(newValue) => handleDateTimeChange(newValue, config.key, 'dateTime')}
                                        className="w-full"
                                        format="DD/MM/YYYY HH:mm"
                                        maxDateTime={now}
                                        minDateTime={isTimestampOut && timestampIn ? timestampIn : undefined}
                                        slotProps={{
                                            textField: {
                                                variant: "outlined",
                                                size: "small",
                                                placeholder: "DD/MM/YYYY HH:mm",
                                                className: "w-full",
                                                error: Boolean(dateErrors[config.key]),
                                                sx: {
                                                    fontFamily: 'inherit',
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '40px',
                                                        fontFamily: 'inherit',
                                                        '& fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#E9F2FF',
                                                            borderWidth: 2,
                                                            borderRadius: '0.25rem'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#BFC3C7',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#0052CC',
                                                            borderWidth: 2,
                                                        },
                                                        '&.Mui-focused .MuiSvgIcon-root': {
                                                            color: dateErrors[config.key] ? '#ef4444' : '#0052CC',
                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            fontSize: '0.875rem',
                                                            padding: '4px 8px',
                                                            height: '22px',
                                                            fontFamily: 'inherit',
                                                            '&::placeholder': {
                                                                fontSize: '0.875rem',
                                                                color: '#BFC3C7',
                                                                opacity: 1,
                                                                fontFamily: 'inherit'
                                                            }
                                                        },
                                                    },
                                                    '& .MuiSvgIcon-root': {
                                                        color: dateErrors[config.key] ? '#ef4444' : '#BFC3C7',
                                                        fontSize: '20px',
                                                    },
                                                    boxShadow: 'none',
                                                    '& .MuiPickersPopper-root, & .MuiPickersDay-root, & .MuiClock-root': {
                                                        fontFamily: 'inherit'
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                                {formData[config.key] && (
                                    <button
                                        className="absolute right-10 top-3 text-lightGray hover:text-gray-500 z-10"
                                        onClick={() => handleDateTimeChange(null, config.key, 'dateTime')}
                                        type="button"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {showDateErrors[config.key] && dateErrors[config.key] && (
                                <div className="absolute z-10 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mt-1 shadow-sm w-full">
                                    {dateErrors[config.key]}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "time":
                return (
                    <div className="relative">
                        <div
                            className="relative"
                            onMouseEnter={() => dateErrors[config.key] ? setShowDateErrors(prev => ({ ...prev, [config.key]: true })) : null}
                            onMouseLeave={() => setShowDateErrors(prev => ({ ...prev, [config.key]: false }))}
                        >
                            <div className="relative">
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                    <TimePicker
                                        value={dayjs.isDayjs(formData[config.key]) ? formData[config.key] as dayjs.Dayjs : null}
                                        onChange={(newValue) => handleDateTimeChange(newValue, config.key, 'time')}
                                        className="w-full"
                                        format="HH:mm:ss"
                                        views={['hours', 'minutes', 'seconds']}
                                        ampm={false}
                                        slotProps={{
                                            textField: {
                                                variant: "outlined",
                                                size: "small",
                                                placeholder: "HH:mm:ss",
                                                className: "w-full",
                                                error: Boolean(dateErrors[config.key]),
                                                sx: {
                                                    fontFamily: 'inherit',
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '40px',
                                                        fontFamily: 'inherit',
                                                        '& fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#E9F2FF',
                                                            borderWidth: 2,
                                                            borderRadius: '0.25rem'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#BFC3C7',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: dateErrors[config.key] ? '#ef4444' : '#0052CC',
                                                            borderWidth: 2,
                                                        },
                                                        '&.Mui-focused .MuiSvgIcon-root': {
                                                            color: dateErrors[config.key] ? '#ef4444' : '#0052CC',
                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            fontSize: '0.875rem',
                                                            padding: '4px 8px',
                                                            height: '22px',
                                                            fontFamily: 'inherit',
                                                            '&::placeholder': {
                                                                fontSize: '0.875rem',
                                                                color: '#BFC3C7',
                                                                opacity: 1,
                                                                fontFamily: 'inherit'
                                                            }
                                                        },
                                                    },
                                                    '& .MuiSvgIcon-root': {
                                                        color: dateErrors[config.key] ? '#ef4444' : '#BFC3C7',
                                                        fontSize: '20px',
                                                    },
                                                    boxShadow: 'none',
                                                    '& .MuiPickersPopper-root, & .MuiPickersDay-root, & .MuiClock-root': {
                                                        fontFamily: 'inherit'
                                                    }
                                                }
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                                {formData[config.key] && (
                                    <button
                                        className="absolute right-10 top-3 text-lightGray hover:text-gray-500 z-10"
                                        onClick={() => handleDateTimeChange(null, config.key, 'time')}
                                        type="button"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {showDateErrors[config.key] && dateErrors[config.key] && (
                                <div className="absolute z-10 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mt-1 shadow-sm w-full">
                                    {dateErrors[config.key]}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-4 rounded">
            <div className="flex flex-col gap-4 w-full">
                <div className='flex flex-wrap gap-4 items-end w-full'>
                    {searchConfig.map((config, index) => (
                        <div key={index} className="flex-1 min-w-[200px]">
                            <label className="block mb-1 text-header">{config.header}</label>
                            {renderInput(config)}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 w-full justify-end">
                    <button
                        onClick={handleClear}
                        className="p-2 bg-secondary text-header rounded hover:bg-secondaryContrast w-32"
                    >
                        ล้าง
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={!isFormValid}
                        className={`p-2 rounded text-secondary w-32 ${isFormValid
                            ? 'bg-primary hover:bg-primaryContrast cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>
    )
}
export default SearchDisplay;