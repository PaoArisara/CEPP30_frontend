import React from 'react';

interface DialogProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
                {children}
            </div>

        </>
    );
};