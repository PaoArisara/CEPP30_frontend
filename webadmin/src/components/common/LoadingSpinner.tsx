import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'กำลังโหลด' }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-secondary border-t-transparent"></div>
        </div>
        <div className="text-xl">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;