import { useState, useEffect, useRef } from "react";
import ImageMapper from "react-img-mapper";
import { Camera, MapPageProps, Slot } from "../../types/Common";

interface Area {
    id: string;
    shape: string;
    coords: number[];
    preFillColor: string;
}

function MapDisplay({ slot, slotEmpty, camera, map }: MapPageProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateContainerWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateContainerWidth();
        window.addEventListener('resize', updateContainerWidth);
        return () => window.removeEventListener('resize', updateContainerWidth);
    }, []);

    useEffect(() => {
        const newAreas = [
            ...(slot || []).map((parkingSlot: Slot) => ({
                id: `${parkingSlot.parking_id}-Z${parkingSlot.zone}-F${parkingSlot.floor}-${parkingSlot.row}${parkingSlot.spot}`,
                shape: "circle",
                coords: [parkingSlot.x_coordinate, parkingSlot.y_coordinate, 15],
                preFillColor: "red",
            })),
            ...(slotEmpty || []).map((parkingSlot: Slot) => ({
                id: `${parkingSlot.parking_id}-Z${parkingSlot.zone}-F${parkingSlot.floor}-${parkingSlot.row}${parkingSlot.spot}`,
                shape: "circle",
                coords: [parkingSlot.x_coordinate, parkingSlot.y_coordinate, 15],
                preFillColor: "green",
            })),
            ...(camera || []).map((cameraSpot: Camera) => ({
                id: `${cameraSpot.camera_id}-Z${cameraSpot.zone}-F${cameraSpot.floor}-${cameraSpot.row}${cameraSpot.spot}`,
                shape: "circle",
                coords: [cameraSpot.x_coordinate, cameraSpot.y_coordinate, 10],
                preFillColor: "blue",
            })),
        ];
        setAreas(newAreas);
    
        
        // console.log("Generated areas:", newAreas); // ตรวจสอบ areas ที่สร้างขึ้น
        // console.log("Generated labels:", newLabels); // ตรวจสอบ labels ที่สร้างขึ้น
    }, [slot, camera, slotEmpty]);

    const [mapImage, setMapImage] = useState('');

    useEffect(() => {
        if (map === "B") {
            setMapImage("/src/assets/zoneB.svg");
        } else if (map === "A") {
            setMapImage("/src/assets/zoneA.svg");
        } else {
            setMapImage('/src/assets/zoneA.svg'); // or set a default image
        }
    }, [map]);

    const calculateImageWidth = () => {
        if (containerWidth < 480) return 280;
        if (containerWidth < 768) return 400;
        if (containerWidth < 1024) return 700;
        return 800;
    };

    const imageWidth = calculateImageWidth();
    return (
        <div ref={containerRef} className="w-full h-full flex justify-center items-center flex-col">
            <div className="relative w-full flex justify-center z-0">
                {mapImage && (
                    <ImageMapper
                        src={mapImage}
                        width={imageWidth}
                        imgWidth={1000}
                        areas={areas} // ✅ ใช้ areas แทน map
                        name="my-map" // ✅ ต้องกำหนด name ด้วย
                        ref={null}   
                        />
                )}
            </div>
        </div>
    );
}

export default MapDisplay;