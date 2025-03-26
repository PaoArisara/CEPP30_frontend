import React from 'react';
import { AlertDescription } from '../Alert';
import { X } from 'lucide-react';

interface TextInputProps {
    label: string;
    name: string;
    value: string;
    require?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    errorMessage?: string;
    onClear?: () => void; 
}

const TextInput: React.FC<TextInputProps> = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    errorMessage, 
    require,
    onClear 
}) => {
    // ฟังก์ชันสำหรับการล้างข้อมูล
    const handleClear = () => {
        if (onClear) {
            onClear();
        } else {
            const event = {
                target: {
                    name,
                    value: ''
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
        }
    };

    return (
        <div className="flex flex-col gap-1 relative">
            <label className="text-header text-md">
                {label} {require && <span className="text-error">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`border-2 focus:border-primary placeholder:text-lightGray hover:border-lightGray
                    w-full rounded py-1.5 px-2 text-base outline-none ${value ? 'pr-8' : ''} ${errorMessage ? 'border-error focus:border-error' : 'border-secondary'}`}
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lightGray hover:text-gray-500"
                        aria-label="Clear text"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            {errorMessage && (
                <AlertDescription variant="destructive" className="text-error text-sm">{errorMessage}</AlertDescription>
            )}
        </div>
    );
};

export default TextInput;