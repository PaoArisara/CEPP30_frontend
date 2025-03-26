import { SimilarityDetails } from "./Active";
import { Pagination, Vehicle } from "./Common";
import { Slot } from "./Slot";

export interface ParkingSlotId {
    parking_id: string;
    zone: string;
    floor: string;
    row: string;
    spot: string;
}

export interface ParkingLogItem {
    parking_log_id: string,
    vehicle_id: string,
    timestamp_in: Date,
    timestamp_out: Date,
    car_image: string,
    license_image: string,
    parkingSlot: Slot
    vehicle: Vehicle
    similarityScore: number,
    similarityDetails: SimilarityDetails
}

export interface ParkingLogResponse {
    data: ParkingLogItem[];
    meta: Pagination
}

export interface ParkingLogFilter {
    page?: number;
    limit?: number;
    log_id?: string | null;
    license_id?: string;
    province?: string;
    vehicle_color?: string;
    vehicle_brand?: string;
    zone?: string;
    floor?: string;
    row?: string;
    spot?: string;
    timestamp_in?: string;
    timestamp_out?: string;
    returnAll?: boolean;
    status?: string | null;
    [key: string]: any;
}

interface CarInfo {
    vehicle: Vehicle;
    totalParkings: number;
    averageParkingTime: string;
}

interface ParkingHistoryEntry {
    parking_log_id: string;
    parking_id: string;
    license_id: string;
    timestamp_in: string;
    timestamp_out: string;
    car_image: string;
    license_image: string;
    parkingSlot: Slot;
    duration: string;
}

export interface HistoryResponse {
    carInfo: CarInfo;
    parkingHistory: ParkingHistoryEntry[];
    meta: Pagination;
}