import React from 'react';

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({
    children,
    className = ''
}) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
};
