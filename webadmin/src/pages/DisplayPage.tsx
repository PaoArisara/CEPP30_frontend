import { useDisplay } from '../hooks/useDisplay';
import ParkingZone from '../components/common/ParkingZone';

function DisplayPage() {
  const {
    slotStatsAData,
    slotStatsBData,
    filtersA,
    filtersB,
    updateZoneFloor,
    loadingA,
    loadingB,
  } = useDisplay();

  const handleClick = (slot: any) => {
    console.log('Clicked slot:', slot);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <ParkingZone
          zone="A"
          floor={filtersA.floor}
          slotStatsData={slotStatsAData}
          loading={loadingA}
          updateZoneFloor={updateZoneFloor}
          handleClick={handleClick}
        />
        
        <ParkingZone
          zone="B"
          floor={filtersB.floor}
          slotStatsData={slotStatsBData}
          loading={loadingB}
          updateZoneFloor={updateZoneFloor}
          handleClick={handleClick}
        />
      </div>
    </div>
  );
}

export default DisplayPage;