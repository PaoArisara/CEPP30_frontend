export interface ParkingActiveResponse {
    data: CarData[];
    meta: PaginationMeta
}

export interface FilterData {
    license_id: string;
    province: { value: string; label: string };
    timestamp_in: { value: string; label: string } | null;
    vehicle_brand: { value: string; label: string } | null;
    vehicle_color: { value: string; label: string } | null;
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
export interface Vehicle {
    vehicle_id: string,
    license_id: string,
    province: string,
    vehicle_color: string,
    vehicle_brand: string
}

export interface Slot {
    parking_id: string,
    floor: string,
    zone: string,
    row: string,
    spot: string,
    x_coordinate: number,
    y_coordinate: number,
    z_coordinate: number,
    camera_id: string
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
}

export interface Camera {
    camera_id: string;
    floor: string;
    zone: string;
    row: string;
    spot: string;
    x_coordinate: number,
    y_coordinate: number,
    z_coordinate: number,
    status: CameraStatus;
    lastStatusChange: string;
}

export type CameraStatus = 'ปกติ' | 'ชำรุด' | 'ไม่ได้ใช้งาน' | 'รอดำเนินการ';

export interface MapPageProps {
    slot: Slot[];
    slotEmpty: Slot[] | null;
    camera: Camera[] | null;
    map: string | null;
    handleClick: (area: any) => void;
}