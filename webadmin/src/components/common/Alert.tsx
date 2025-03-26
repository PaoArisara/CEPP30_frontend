import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AlertProps {
    variant?: 'default' | 'destructive';
    className?: string;
    children?: React.ReactNode;
}

interface AlertDescriptionProps {
    children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
    variant = 'default',
    className = '',
    children,
    ...props
}) => {
    const baseStyles = "relative w-full rounded border p-4";
    const variantStyles = {
        default: "bg-gray-50 text-gray-900 border-gray-200",
        destructive: "bg-red-50 text-red-900 border-red-200"
    };

    return (
        <div
            role="alert"
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            <div className='flex items-center justify-between'>
                {children}
                {variant === 'destructive' && (
                    <AlertTriangle className=" h-4 w-4 text-red-600" />
                )}
            </div>
        </div>
    );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({
    children,
    ...props
}) => {
    return (
        <div className="text-sm leading-6" {...props}>
            {children}
        </div>
    );
};

export { Alert, AlertDescription };