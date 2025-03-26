import React, { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import { AlertDescription } from '../Alert';
import { X, AlertCircle } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';

interface TimePickerProps {
    label: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    placeholder?: string;
    errorMessage?: string;
    required?: boolean;
    views?: ('hours' | 'minutes' | 'seconds')[];
    format?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
    label,
    value,
    onChange,
    placeholder = "HH:mm:ss",
    errorMessage,
    required = false,
    views = ['hours', 'minutes', 'seconds'],
    format = "HH:mm:ss"
}) => {
    const [showError, setShowError] = useState(false);
    
    // ฟังก์ชันตรวจสอบว่าเวลาเกินปัจจุบันหรือไม่
    const validateTime = (timeValue: Dayjs | null): string => {
        if (!timeValue) return '';
        
        if (!timeValue.isValid()) {
            return 'รูปแบบเวลาไม่ถูกต้อง';
        }
        
        const currentTime = dayjs();
        
        // เปรียบเทียบเฉพาะเวลาโดยไม่สนใจวันที่
        if (
            timeValue.hour() > currentTime.hour() ||
            (timeValue.hour() === currentTime.hour() && timeValue.minute() > currentTime.minute()) ||
            (timeValue.hour() === currentTime.hour() && timeValue.minute() === currentTime.minute() && timeValue.second() > currentTime.second())
        ) {
            return 'เวลาต้องไม่เกินเวลาปัจจุบัน';
        }
        
        return '';
    };
    
    // ใช้สำหรับตรวจสอบเวลาเมื่อมีการเปลี่ยนแปลง
    const handleTimeChange = (newValue: Dayjs | null) => {
        onChange(newValue);
    };
    
    // คำนวณความผิดพลาดจากค่าปัจจุบัน
    const timeError = validateTime(value);
    const hasError = !!errorMessage || !!timeError;
    
    return (
        <div className="flex flex-col gap-1 relative">
            <label className="text-header text-md">
                {label} {required && <span className="text-error">*</span>}
            </label>
            <div
                className="relative"
                onMouseEnter={() => timeError ? setShowError(true) : null}
                onMouseLeave={() => setShowError(false)}
            >
                <div className="relative">
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                        <MuiTimePicker
                            value={value}
                            onChange={handleTimeChange}
                            className="w-full"
                            format={format}
                            views={views}
                            ampm={false}
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    size: "small",
                                    placeholder: placeholder,
                                    className: "w-full",
                                    error: hasError,
                                    sx: {
                                        fontFamily: 'inherit',
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            fontFamily: 'inherit',
                                            '& fieldset': {
                                                borderColor: hasError ? '#CF283C' : '#E9F2FF',
                                                borderWidth: 2,
                                                borderRadius: '0.25rem'
                                            },
                                            '&:hover fieldset': {
                                                borderColor: hasError ? '#CF283C' : '#BFC3C7',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: hasError ? '#CF283C' : '#0052CC',
                                                borderWidth: 2,
                                            },
                                            '&.Mui-focused .MuiSvgIcon-root': {
                                                color: hasError ? '#CF283C' : '#0052CC',
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                fontSize: '16px',
                                                padding: '4px 8px',
                                                height: '22px',
                                                fontFamily: 'inherit',
                                                color: '#42526E',
                                                '&::placeholder': {
                                                    fontSize: '16px',
                                                    color: '#BFC3C7',
                                                    opacity: 1,
                                                    fontFamily: 'inherit'
                                                }
                                            },
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: hasError ? '#CF283C' : '#BFC3C7',
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
                    {value && (
                        <button
                            className="absolute right-10 top-3 text-lightGray hover:text-gray-500 z-10"
                            onClick={() => onChange(null)}
                            type="button"
                            aria-label="Clear time"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>
            {errorMessage && (
                <AlertDescription variant="destructive" className="text-error text-sm mt-1">{errorMessage}</AlertDescription>
            )}
        </div>
    );
};

export default TimePicker;