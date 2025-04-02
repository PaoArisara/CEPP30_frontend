// pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import Breadcrumb from '../components/layout/Breadcrumb';
import HorizontalBarChart from '../components/common/HorizontalBarChart';
import CardDataStats from '../components/common/CardDataStats';
import { CameraIcon, TruckIcon } from 'lucide-react';
import ParkingTrendChart from '../components/common/ParkingTrendChart';
import ParkingPeakChart from '../components/common/ParkingPeakChart';
import useDashboard from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    loading,
    slotStatsAData,
    slotStatsBData,
    slotData,
    cameraData,
    zoneAChartData,
    zoneBChartData,
    fetchTrendChartData,
    fetchPeakChartData
  } = useDashboard();

  // State for storing current date and time
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString());
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString([], { hour12: false }));

  // Update current date and time every secon// pages/DashboardPage.tsx (continued)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString());
      setCurrentTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initial auth check
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);


  if (authLoading || loading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumb pageName="ภาพรวมการใช้งานลานจอด" />

      <div className='flex flex-col gap-4'>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardDataStats
            row1="วันและเวลาปัจจุบัน"
            row2={currentDate}
            icon={<p className="font-bold text-xl text-primary">{currentTime}</p>}
          />
          <CardDataStats
            row1="จำนวนช่องจอดทั้งหมด (ช่อง)"
            row2={slotData.total}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                <TruckIcon className="w-5 h-5 text-primary" />
              </div>
            }
          />
          <CardDataStats
            row1="จำนวนกล้องทั้งหมด (ตัว)"
            row2={cameraData.total}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                <CameraIcon className="w-5 h-5 text-primary" />
              </div>
            }
          />
        </div>
        <div className='flex flex-col gap-4'>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            <HorizontalBarChart data={slotStatsAData} />
            <HorizontalBarChart data={slotStatsBData} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
            <ParkingTrendChart
              zoneAData={zoneAChartData}
              zoneBData={zoneBChartData}
              fetchData={fetchTrendChartData}
            />
            <ParkingPeakChart
              zoneAData={zoneAChartData}
              zoneBData={zoneBChartData}
              fetchData={fetchPeakChartData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;