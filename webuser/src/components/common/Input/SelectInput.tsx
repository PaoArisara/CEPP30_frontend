import React from 'react';
import Select from 'react-select';
import { AlertDescription } from '../Alert';

interface SelectInputProps {
    label: string;
    options: { value: string; label: string }[];
    value: { value: string; label: string } | null;
    onChange: (selectedOption: { value: string; label: string } | null) => void;
    placeholder: string;
    errorMessage?: string;
    require?:boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    errorMessage,
    require
}) => {
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderColor: errorMessage ? '#CF283C' : state.isFocused ? '#0052CC' : '#E9F2FF',
            borderWidth: '2px',
            borderRadius: '0.25rem',
            fontSize: '16px',
            boxShadow: 'none',
            minHeight: '40px',
            height: '40px',
            '&:hover': {
                borderColor: errorMessage ? '#CF283C' : state.isFocused ? '#0052CC' : '#E9F2FF',
            }
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            height: '38px',
            padding: '0 6px'
        }),
        input: (provided: any) => ({
            ...provided,
            margin: '0px',
            color: '#42526E', // เปลี่ยนสีฟอนต์เป็น #42526E
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#BFC3C7', // เปลี่ยนสีฟอนต์ของ placeholder เป็น #BFC3C7
            fontSize: '16px',
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: '#42526E',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#E9F2FF' : 'white',
            color: state.isSelected ? '#0052CC' : '#42526E',
            fontSize: '14px',
            padding: '8px 12px',
            '&:hover': {
                backgroundColor: '#E9F2FF',
            }
        }),
    };

    
    return (
        <div className="flex flex-col gap-1 relative">
            <label className="text-header text-md">
                {label} {require && <span className="text-error">*</span>}
            </label>
            <div className="relative">
                <Select
                    options={options}
                    styles={customStyles}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    isClearable
                    classNamePrefix="select"
                />
            </div>
                {errorMessage && (
                    <AlertDescription variant="destructive" className="text-error text-sm">{errorMessage}</AlertDescription>
                )}
        </div>
    );
};

export default SelectInput;