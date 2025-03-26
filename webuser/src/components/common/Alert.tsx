import React from 'react';
import { AlertCircleIcon} from 'lucide-react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface AlertProps {
    variant?: 'default' | 'destructive';
    className?: string;
    children?: React.ReactNode;
}

interface AlertDescriptionProps {
    children?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'destructive';
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
        destructive: "bg-red-50 text-error border-error"
    };

    return (
        <div
            role="alert"
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            <div className='flex items-center gap-2'>
                {variant === 'destructive' && (
                    <AlertCircleIcon className=" h-5 w-5 text-error" />
                )}
                {children}
            </div>
        </div>
    );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({
    children,
    className,
    variant,
    ...props
}) => {
    return (
        <div className={`text-sm leading-6 flex gap-1 items-center ${className}`} {...props}>
            <p>
                {variant === 'destructive' && (
                    <ExclamationCircleIcon className="w-4 h-4 text-error" />
                )}
            </p>
            <p>
                {children}
            </p>
        </div>
    );
};

export { Alert, AlertDescription };