import { useState, useEffect, useRef } from "react";
import ImageMapper from "react-img-mapper";
import { MapPageProps } from "../../types/Common";
import { Slot } from "../../types/Slot";
import { Camera } from "../../types/Camera";

interface Area {
    id: string;
    shape: string;
    coords: number[];
    preFillColor: string;
}

interface Label {
    x: number;
    y: number;
    text: string;
}

interface ExtendedMapPageProps extends MapPageProps {
    isLabel?: boolean;
}

function MapDisplay({ 
    slot, 
    slotEmpty, 
    camera, 
    map, 
    handleClick,
    isLabel = true 
}: ExtendedMapPageProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
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
                id: `${parkingSlot.parking_id}`,
                shape: "circle",
                coords: [parkingSlot.x_coordinate, parkingSlot.y_coordinate, 15],
                preFillColor: "red",
            })),
            ...(slotEmpty || []).map((parkingSlot: Slot) => ({
                id: `${parkingSlot.parking_id}`,
                shape: "circle",
                coords: [parkingSlot.x_coordinate, parkingSlot.y_coordinate, 15],
                preFillColor: "green",
            })),
            ...(camera || []).map((cameraSpot: Camera) => ({
                id: `${cameraSpot.camera_id}`,
                shape: "circle",
                coords: [cameraSpot.x_coordinate, cameraSpot.y_coordinate, 12],
                preFillColor: "blue",
            })),
        ];
        setAreas(newAreas);
    
        const newLabels = [
            ...(slot || []).map((parkingSlot: Slot) => ({
                x: parkingSlot.x_coordinate,
                y: parkingSlot.y_coordinate,
                text: `${parkingSlot.parking_id}`,
            })),
            ...(slotEmpty || []).map((parkingSlot: Slot) => ({
                x: parkingSlot.x_coordinate,
                y: parkingSlot.y_coordinate,
                text: `${parkingSlot.parking_id}`,
            })),
            ...(camera || []).map((cameraSpot: Camera) => ({
                x: cameraSpot.x_coordinate,
                y: cameraSpot.y_coordinate,
                text: `${cameraSpot.camera_id}`,
            })),
        ];
        setLabels(newLabels);
        
    }, [slot, camera, slotEmpty]);

    const [mapImage, setMapImage] = useState('');

    useEffect(() => {
        console.log(map);
        
        if (map === "B") {
            setMapImage("/src/assets/zoneB.svg");
        } else if (map === "A") {
            setMapImage("/src/assets/zoneA.svg");
        } else {
            setMapImage('/src/assets/zoneA.svg');
        }
    }, [map]);

    const calculateImageWidth = () => {
        if (containerWidth < 480) return 280;
        if (containerWidth < 768) return 400;
        if (containerWidth < 1024) return 700;
        return 800;
    };

    const imageWidth = calculateImageWidth();
    const scale = imageWidth / 1000;

    const onAreaClick = (area: any) => {
        console.log("Area clicked:", area);
        const parkingSlotId = area.id?.split("-")[0];
    
        const isNotEmpty = area.preFillColor === "red";
    
        if (isNotEmpty) {
            console.log(`Clicked on slot ${parkingSlotId}`);
            handleClick(area);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full flex justify-center items-center flex-col">
            <div className="relative w-full flex justify-center">
                {mapImage && (
                    <ImageMapper
                        src={mapImage}
                        width={imageWidth}
                        imgWidth={1000}
                        areas={areas}
                        name="my-map"
                        onClick={(area) => onAreaClick(area)} 
                        ref={null}
                    />
                )}
                {isLabel && labels.length > 0 && (
                    <div
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
                        style={{
                            width: `${imageWidth}px`,
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        {labels.map((label, index) => (
                            <div
                                key={index}
                                className="absolute whitespace-nowrap"
                                style={{
                                    left: `${label.x * scale}px`,
                                    top: `${label.y * scale}px`,
                                    transform: 'translate(-50%, -50%)',
                                    color: 'white',
                                    fontSize: `${Math.max(12 * scale, 10)}px`,
                                    fontWeight: 'bold',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    zIndex: 10,
                                    padding: '2px 4px',
                                    borderRadius: '2px'
                                }}
                            >
                                {label.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MapDisplay;