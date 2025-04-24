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

