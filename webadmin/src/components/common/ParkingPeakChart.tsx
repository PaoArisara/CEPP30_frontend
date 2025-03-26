// components/common/ParkingPeakChart.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ParkingPeakChartProps {
  zoneAData: {
    peakChart: {
      peakHourAnalysis: {
        hourlyData: any[];
        peakHours: {
          occupancy: { hour: number; count: number };
          entry: { hour: number; count: number };
          exit: { hour: number; count: number };
        }
      },
      daylyTrend: Array<{
        date: string;
        totalParkings: number;
        totalDuration: number;
        averageDuration: string;
        revenue: number;
      }>
    }
  };
  zoneBData: {
    peakChart: {
      peakHourAnalysis: {
        hourlyData: any[];
        peakHours: {
          occupancy: { hour: number; count: number };
          entry: { hour: number; count: number };
          exit: { hour: number; count: number };
        }
      },
      daylyTrend: Array<{
        date: string;
        totalParkings: number;
        totalDuration: number;
        averageDuration: string;
        revenue: number;
      }>
    }
  };
  fetchData: (options: { year: number; month: number }, zone: 'A' | 'B') => void;
}

type ViewType = 'hour' | 'day';

const ParkingPeakChart: React.FC<ParkingPeakChartProps> = ({
  zoneAData,
  zoneBData,
  fetchData
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const [viewType, setViewType] = useState<ViewType>('hour');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // สร้างตัวเลือกปีโดยไม่เกินปีปัจจุบัน
  const availableYears = useMemo(() => {
    // สร้างปีย้อนหลัง 5 ปีจนถึงปีปัจจุบัน
    const startYear = currentYear - 5;
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => startYear + index);
  }, [currentYear]);

  // สร้างตัวเลือกเดือนที่แสดงได้
  const availableMonths = useMemo(() => {
    const months = [
      { value: 1, label: 'มกราคม' },
      { value: 2, label: 'กุมภาพันธ์' },
      { value: 3, label: 'มีนาคม' },
      { value: 4, label: 'เมษายน' },
      { value: 5, label: 'พฤษภาคม' },
      { value: 6, label: 'มิถุนายน' },
      { value: 7, label: 'กรกฎาคม' },
      { value: 8, label: 'สิงหาคม' },
      { value: 9, label: 'กันยายน' },
      { value: 10, label: 'ตุลาคม' },
      { value: 11, label: 'พฤศจิกายน' },
      { value: 12, label: 'ธันวาคม' }
    ];

    // ถ้าเลือกปีปัจจุบัน จำกัดเดือนไม่เกินเดือนปัจจุบัน
    if (selectedYear === currentYear) {
      return months.filter(month => month.value <= currentMonth);
    }
    
    // ถ้าไม่ใช่ปีปัจจุบัน แสดงทุกเดือน
    return months;
  }, [selectedYear, currentYear, currentMonth]);

  // เมื่อมีการเปลี่ยนปี ตรวจสอบว่าเดือนที่เลือกอยู่ถูกต้องหรือไม่
  useEffect(() => {
    // ถ้าเลือกปีปัจจุบันและเดือนที่เลือกมากกว่าเดือนปัจจุบัน
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear, currentYear, currentMonth]);

  useEffect(() => {
    console.log('Fetching data with year:', selectedYear, 'month:', selectedMonth);
    fetchData({
      year: selectedYear,
      month: selectedMonth
    }, 'A');
    fetchData({
      year: selectedYear,
      month: selectedMonth
    }, 'B');
  }, [selectedYear, selectedMonth, fetchData]);

  // Change handlers
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    setSelectedYear(year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = Number(e.target.value);
    setSelectedMonth(month);
  };

  // Get peak time display for hourly view
  const getPeakTimeDisplay = () => {
    const peakA = zoneAData?.peakChart?.peakHourAnalysis?.peakHours?.entry;
    const peakB = zoneBData?.peakChart?.peakHourAnalysis?.peakHours?.entry;

    if (!peakA && !peakB) return '-';

    const peakCountA = peakA?.count || 0;
    const peakCountB = peakB?.count || 0;

    const bestPeak = peakCountA >= peakCountB ? peakA : peakB;

    if (!bestPeak) return '-';

    return `เวลา ${bestPeak.hour.toString().padStart(2, '0')}:00 (${bestPeak.count} คัน)`;
  };

  // Get peak day display for daily view
  const getPeakDayDisplay = () => {
    const dailyTrendA = zoneAData?.peakChart?.daylyTrend || [];
    const dailyTrendB = zoneBData?.peakChart?.daylyTrend || [];

    // Combine and sort daily trends
    const combinedDailyTrend = [...dailyTrendA, ...dailyTrendB]
      .filter(entry => entry.totalParkings > 0)
      .sort((a, b) => b.totalParkings - a.totalParkings);

    if (combinedDailyTrend.length === 0) return '-';

    const peakDay = combinedDailyTrend[0];
    return `${peakDay.date} (${peakDay.totalParkings} คัน)`;
  };

  // Memoized chart data
  const chartData = useMemo(() => {
    console.log('Updating chart data with:', { zoneAData, zoneBData, viewType });

    if (viewType === 'hour') {
      const hourlyDataA = zoneAData?.peakChart?.peakHourAnalysis?.hourlyData || [];
      const hourlyDataB = zoneBData?.peakChart?.peakHourAnalysis?.hourlyData || [];

      // สร้างข้อมูลสำหรับแต่ละชั่วโมงเป็น 24 ชั่วโมง (0-23)
      const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

      // สร้างอาร์เรย์ว่างที่มีช่อง 24 ช่องสำหรับข้อมูลแต่ละชั่วโมง
      const dataA = new Array(24).fill(0);
      const dataB = new Array(24).fill(0);

      // ใส่ข้อมูลเข้าไปในแต่ละช่องตามชั่วโมง
      hourlyDataA.forEach((data) => {
        // ดึงข้อมูลชั่วโมงจาก hourlyData
        let hour: number;
        if (typeof data.hour === 'string') {
          hour = parseInt(data.hour);
        } else if (typeof data.hour === 'number') {
          hour = data.hour;
        } else {
          return; // ข้ามข้อมูลที่ไม่มีชั่วโมง
        }

        // ตรวจสอบว่าชั่วโมงถูกต้อง (0-23)
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          dataA[hour] = data.entries || data.count || 0;
        }
      });

      hourlyDataB.forEach((data) => {
        let hour: number;
        if (typeof data.hour === 'string') {
          hour = parseInt(data.hour);
        } else if (typeof data.hour === 'number') {
          hour = data.hour;
        } else {
          return;
        }

        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          dataB[hour] = data.entries || data.count || 0;
        }
      });

      return {
        labels,
        datasets: [
          {
            label: 'ลานจอด A',
            data: dataA,
            backgroundColor: '#0052CC',
            borderRadius: 4,
            barThickness: 8,
          },
          {
            label: 'ลานจอด B',
            data: dataB,
            backgroundColor: '#F386B2',
            borderRadius: 4,
            barThickness: 8,
          }
        ]
      };
    } else {
      // Day view
      const dailyTrendA = zoneAData?.peakChart?.daylyTrend || [];
      const dailyTrendB = zoneBData?.peakChart?.daylyTrend || [];

      // Generate labels for the current month's days
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

      const dataA = new Array(labels.length).fill(0);
      const dataB = new Array(labels.length).fill(0);

      dailyTrendA.forEach((data) => {
        const day = parseInt(data.date?.split('/')[0] || '0') - 1;
        if (!isNaN(day) && day >= 0 && day < daysInMonth) {
          dataA[day] = data.totalParkings || 0;
        }
      });

      dailyTrendB.forEach((data) => {
        const day = parseInt(data.date?.split('/')[0] || '0') - 1;
        if (!isNaN(day) && day >= 0 && day < daysInMonth) {
          dataB[day] = data.totalParkings || 0;
        }
      });

      return {
        labels,
        datasets: [
          {
            label: 'ลานจอด A',
            data: dataA,
            backgroundColor: '#0052CC',
            borderRadius: 4,
            barThickness: 12,
          },
          {
            label: 'ลานจอด B',
            data: dataB,
            backgroundColor: '#F386B2',
            borderRadius: 4,
            barThickness: 12,
          }
        ]
      };
    }
  }, [viewType, selectedYear, selectedMonth, zoneAData, zoneBData]);

  // Chart options
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          padding: 10,
          pointStyleWidth: 20,
          font: {
            size: 14,
            family: "'Prompt', sans-serif",
            weight: 'normal',
          },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'white',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 13,
          family: "'Prompt', sans-serif"
        },
        titleFont: {
          size: 13,
          family: "'Prompt', sans-serif"
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: {
            size: 12,
            family: "'Prompt', sans-serif"
          },
          maxRotation: viewType === 'hour' ? 45 : 0,
          autoSkip: true,
          autoSkipPadding: 10
        }
      },
      y: {
        min: 0,
        border: { display: false },
        ticks: {
          font: {
            size: 12,
            family: "'Prompt', sans-serif"
          },
          stepSize: 5,
          callback: (value) => `${value} คัน`
        },
        grid: {
          color: '#f0f0f0'
        }
      }
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-secondary">
      <div className="">
        <div className="flex-1 text-left pr-4 pb-2">
          <h2 className="text-lg font-semibold text-header">
            {viewType === 'hour' ? 'ช่วงเวลาเข้าจอดยอดนิยม' : 'วันที่มีการจอดรถมากที่สุด'}
          </h2>
          <h3 className="text-2xl font-bold text-primary mt-1">
            {viewType === 'hour' ? getPeakTimeDisplay() : getPeakDayDisplay()}
          </h3>
        </div>

        <div className="flex gap-2 items-center pb-4">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="text-header text-sm border border-secondary rounded px-4 py-1.5 hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
              minWidth: '90px',
            }}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>ปี {year}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="text-header text-sm border border-secondary rounded px-4 py-1.5 hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
              minWidth: '90px',
            }}
          >
            {availableMonths.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>

          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className="text-header text-sm border border-secondary rounded px-4 py-1.5 hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round'              stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
              minWidth: '90px',
            }}
          >
            <option value="hour">รายชั่วโมง</option>
            <option value="day">รายวัน</option>
          </select>
        </div>
      </div>

      <div className="h-48">
        <Bar
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default ParkingPeakChart;