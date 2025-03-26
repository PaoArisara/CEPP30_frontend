import { CarData } from "./Active";
import { Camera } from "./Camera";
import { Slot } from "./Slot";

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface WebSocketResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export interface InfoCardProps {
    info: CarData[];
    handleClick: (data: CarData) => void;
}

export interface MapPageProps {
    slot: Slot[];
    slotEmpty: Slot[] | null;
    camera: Camera[] | null;
    map: string | null;
    isLabel?: boolean;
    handleClick: (area: any) => void;
}

export interface FloorData {
    zone: string,
    floor: string,
    total: number,
    occupied: number,
    available: number,
    occupancyRate: string
}

export interface Vehicle {
    vehicle_id: string,
    license_id: string,
    province: string,
    vehicle_color: string,
    vehicle_brand: string
}