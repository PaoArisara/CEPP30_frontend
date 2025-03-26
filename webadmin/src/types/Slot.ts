import { CarData } from "./Active";
import { Camera } from "./Camera";
import { Pagination } from "./Common"

export interface SlotResponse {
  data: Slot[];
  meta: Pagination
}

export interface Slot {
  parking_id: string,
  zone: string,
  floor: string,
  row: string,
  spot: string,
  x_coordinate: number,
  y_coordinate: number,
  z_coordinate: number,
  camera?: Camera
}

export interface SlotStats {
  occupied: Slot[]; // List of occupied slots
  available: Slot[]; // List of available slots
  summary: SlotSummary; // Total, occupied, and available count for this floor/zone
}

export interface SlotSummary {
  total: number;
  occupied: number;
  available: number;
  location: {
    zone: string;
    floor: string;
  };
}

export interface FindSlotByID {
  slotInfo: Slot,
  carInfo: CarData
}

export interface ParkingUtilization {
  totalParkings: number;
  averageDuration: string;
  utilizationRate: number;
  totalSlots: number;
};

export interface RateDetails {
  hourlyRate: number;
  dailyMaxRate: number;
};

export interface RevenueEstimation {
  totalRevenue: number;
  averageDailyRevenue: number;
  totalParkings: number;
  rateDetails: RateDetails;
};

export interface HourlyData {
  hour: string;
  occupancy: number;
  entries: number;
  exits: number;
};

export interface PeakHourDetails {
  hour: number;
  count: number;
};

export interface PeakHourAnalysis {
  hourlyData: HourlyData[];
  peakHours: {
    occupancy: PeakHourDetails;
    entry: PeakHourDetails;
    exit: PeakHourDetails;
  };
};

export interface DaylyTrend {
  date: string;
  totalParkings: number;
  totalDuration: number;
  averageDuration: string;
  revenue: number;
};

export interface MonthlyTrend {
  month: string;
  totalParkings: number;
  totalDuration: number;
  averageDuration: string;
  revenue: number;
};

export interface YearlyTrend {
  year: number;
  month: string;
  totalParkings: number;
  averageDuration: string;
  revenue: number;
}
export interface ParkingData {
  parkingUtilization: ParkingUtilization;
  revenueEstimation: RevenueEstimation;
  peakHourAnalysis: PeakHourAnalysis;
  daylyTrend: DaylyTrend[];
  monthlyTrend: MonthlyTrend[];
  yearlyTrend: YearlyTrend[]
};


export interface CategoryData {
  total: number;
  available: number;
  occupied:number
}

export interface SlotCount {
  [key: string]: {
    [key: string]: CategoryData;
  };
}