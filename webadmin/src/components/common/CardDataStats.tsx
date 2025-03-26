import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  row1: string;
  row2: string | ReactNode;
  icon: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  row1,
  row2,
  icon
}) => {
  return (
    <div className="rounded border border-secondary bg-white py-6 px-6">
      <div className="flex w-full justify-between items-center">
        <div className='text-header'>
          <p className='text-mediumGray text-sm'>{row1}</p>
          <p className='font-bold'>{row2}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
};

export default CardDataStats;