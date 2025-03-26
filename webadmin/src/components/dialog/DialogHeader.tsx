import React from 'react';

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`p-4 border-b ${className}`}>
            {children}
        </div>
    );
};