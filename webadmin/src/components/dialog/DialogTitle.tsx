import React from 'react';

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
    children,
    className = ''
}) => {
    return (
        <h2 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h2>
    );
};