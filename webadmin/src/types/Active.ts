import { Pagination, Vehicle } from "./Common";
import { Slot, SlotResponse } from "./Slot";

export interface CarState {
    info: ParkingActiveResponse;
    infomation?: CarData;
    slot: SlotResponse;
    viewMode: "default" | "search" | "info";
    filters: Record<string, string | null>;
    error: string;
    currentPage: number;
    itemsPerPage: number;
    lastRefreshTime: Date;
}

export interface ParkingActiveResponse {
    data: CarData[];
    meta: Pagination
}


export interface CarData {
    parking_active_id: string;
    parking_id: string;
    vehicle_id: string;
    timestamp_in: string;
    car_image: string;
    license_image: string;
    parkingSlot: Slot;
    vehicle: Vehicle;
    similarityScore: number;
    similarityDetails: SimilarityDetails
}

export interface SimilarityDetails {
    licenseScore: number,
    provinceMatch: boolean,
    colorMatch: boolean,
    brandMatch: boolean
}
// types/Parking.ts

export interface FloorStatusResponse {
    success: boolean;
    data: Array<{
        zone: string;
        floor: string;
        total: number;
        occupied: number;
        available: number;
        occupancyRate: string;
    }>;
    timestamp: string;
}

export interface FloorStatusData {
    zone: string;
    floor: string;
    total: number;
    occupied: number;
    available: number;
    occupancyRate: string;
}

export interface WebSocketResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
    error?: string;
}