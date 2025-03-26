// components/common/ParkingTrendChart.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Thai months constant
const thaiMonths: string[] = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

interface ParkingTrendChartProps {
  zoneAData: {
    trendChart: {
      monthlyTrend: any[];
      yearlyTrend: any[];
    }
  };
  zoneBData: {
    trendChart: {
      monthlyTrend: any[];
      yearlyTrend: any[];
    }
  };
  fetchData: (options: { year: number; month: number }, zone: 'A' | 'B') => void;
}

type ViewType = 'month' | 'year';

const ParkingTrendChart: React.FC<ParkingTrendChartProps> = ({ 
  zoneAData, 
  zoneBData, 
  fetchData 
}) => {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch data when view type or selected period changes
  useEffect(() => {
    fetchData({ 
      year: selectedYear, 
      month: selectedMonth 
    }, 'A');
    fetchData({ 
      year: selectedYear, 
      month: selectedMonth 
    }, 'B');
  }, [selectedYear, selectedMonth, fetchData]);

  // Memoized chart data
  const chartData: ChartData<'line'> = useMemo(() => {
    const currentMonthlyTrendA = zoneAData?.trendChart?.monthlyTrend || [];
    const currentMonthlyTrendB = zoneBData?.trendChart?.monthlyTrend || [];
    const currentYearlyTrendA = zoneAData?.trendChart?.yearlyTrend || [];
    const currentYearlyTrendB = zoneBData?.trendChart?.yearlyTrend || [];

    const labels = viewType === 'month' 
      ? thaiMonths 
      : currentYearlyTrendA.map(trend => trend.year.toString());

    const zoneParkingData = {
      A: viewType === 'month'
        ? currentMonthlyTrendA.map(trend => trend.totalParkings || 0)
        : currentYearlyTrendA.map(trend => trend.totalParkings || 0),
      B: viewType === 'month'
        ? currentMonthlyTrendB.map(trend => trend.totalParkings || 0)
        : currentYearlyTrendB.map(trend => trend.totalParkings || 0)
    };

    // Ensure we have 12 data points for monthly view
    const fillData = (data: number[]): number[] => {
      return viewType === 'month' 
        ? [...data, ...Array(12 - data.length).fill(0)].slice(0, 12)
        : data;
    };

    return {
      labels,
      datasets: [
        {
          label: 'ลานจอด A',
          data: fillData(zoneParkingData.A),
          borderColor: '#0052CC',
          backgroundColor: 'rgba(0, 82, 204, 0.2)',
          pointBackgroundColor: '#0052CC',
          pointBorderColor: '#0052CC',
          tension: 0.4,
        },
        {
          label: 'ลานจอด B',
          data: fillData(zoneParkingData.B),
          borderColor: '#F386B2',
          backgroundColor: 'rgba(243, 134, 178, 0.2)',
          pointBackgroundColor: '#F386B2',
          pointBorderColor: '#F386B2',
          tension: 0.4,
        },
      ],
    };
  }, [viewType, zoneAData, zoneBData]);

  // Calculate current total
  const getCurrentTotal = (): number => {
    const currentYearlyTrendA = zoneAData?.trendChart?.yearlyTrend || [];
    const currentYearlyTrendB = zoneBData?.trendChart?.yearlyTrend || [];
    const currentMonthlyTrendA = zoneAData?.trendChart?.monthlyTrend || [];
    const currentMonthlyTrendB = zoneBData?.trendChart?.monthlyTrend || [];
  
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
  
    if (viewType === 'month') {
      const zoneAMonthlyTotal = currentMonthlyTrendA[currentMonth]?.totalParkings || 0;
      const zoneBMonthlyTotal = currentMonthlyTrendB[currentMonth]?.totalParkings || 0;
      return zoneAMonthlyTotal + zoneBMonthlyTotal;
    } else {
      const zoneAYearlyTotal = currentYearlyTrendA
        .find(trend => trend.year === currentYear)?.totalParkings || 0;
      const zoneBYearlyTotal = currentYearlyTrendB
        .find(trend => trend.year === currentYear)?.totalParkings || 0;
      return zoneAYearlyTotal + zoneBYearlyTotal;
    }
  };

  // Calculate growth rate
  const getGrowthRate = (): string => {
    const currentYearlyTrendA = zoneAData?.trendChart?.yearlyTrend || [];
    const currentYearlyTrendB = zoneBData?.trendChart?.yearlyTrend || [];
    const currentMonthlyTrendA = zoneAData?.trendChart?.monthlyTrend || [];
    const currentMonthlyTrendB = zoneBData?.trendChart?.monthlyTrend || [];
  
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
  
    let currentTotal = 0;
    let previousTotal = 0;
  
    if (viewType === 'month') {
      const zoneAMonthlyTotal = currentMonthlyTrendA[currentMonth]?.totalParkings || 0;
      const zoneBMonthlyTotal = currentMonthlyTrendB[currentMonth]?.totalParkings || 0;
      
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const zoneAPrevMonthTotal = currentMonthlyTrendA[prevMonth]?.totalParkings || 0;
      const zoneBPrevMonthTotal = currentMonthlyTrendB[prevMonth]?.totalParkings || 0;
  
      currentTotal = zoneAMonthlyTotal + zoneBMonthlyTotal;
      previousTotal = zoneAPrevMonthTotal + zoneBPrevMonthTotal;
    } else {
      const prevYear = currentYear - 1;
  
      const zoneACurrentYearTotal = currentYearlyTrendA
        .find(trend => trend.year === currentYear)?.totalParkings || 0;
      const zoneBCurrentYearTotal = currentYearlyTrendB
        .find(trend => trend.year === currentYear)?.totalParkings || 0;
      const zoneAPrevYearTotal = currentYearlyTrendA
        .find(trend => trend.year === prevYear)?.totalParkings || 0;
      const zoneBPrevYearTotal = currentYearlyTrendB
        .find(trend => trend.year === prevYear)?.totalParkings || 0;
  
      currentTotal = zoneACurrentYearTotal + zoneBCurrentYearTotal;
      previousTotal = zoneAPrevYearTotal + zoneBPrevYearTotal;
    }
  
    if (!previousTotal) return '+0.00%';
    const growth = ((currentTotal - previousTotal) / previousTotal) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          padding: 10,
          pointStyleWidth: 20,
          font: {
            size: 14,
            family: "'Prompt', sans-serif",
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'white',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 13,
          family: "'Prompt', sans-serif",
          weight: 'normal' as const,
        },
        titleFont: {
          size: 13,
          family: "'Prompt', sans-serif",
          weight: 'normal' as const,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: {
            size: 12,
            family: "'Prompt', sans-serif",
          },
          maxRotation: 45,
        },
      },
      y: {
        min: 0,
        border: { display: false },
        ticks: {
          font: {
            size: 12,
            family: "'Prompt', sans-serif",
          },
          stepSize: 10,
        },
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  return (
    <div className="w-full max-w-full p-6 bg-white rounded-lg border border-secondary">
      <div className="mb-6 flex w-full justify-between gap-4 items-start">
        <div className="flex-1 text-left pr-4">
          <h2 className="text-lg font-semibold text-header">แนวโน้มการใช้งานจอดรถ</h2>
          <h3 className="text-2xl font-bold text-primary mt-1">
            ({getCurrentTotal().toLocaleString()} คัน)
          </h3>
          <p className="text-sm text-header">
            การใช้ลานจอด{viewType === 'month' ? 'เดือน' : 'ปี'}นี้{' '}
            <span className={getGrowthRate().startsWith('+') ? 'text-green-600' : 'text-red-600'}>
              {getGrowthRate()}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className="text-header text-sm border border-secondary rounded px-4 py-1.5 hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
              minWidth: '90px',
            }}
          >
            <option value="month">เดือน</option>
            <option value="year">ปี</option>
          </select>
        </div>
      </div>

      <div className="h-48">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ParkingTrendChart;