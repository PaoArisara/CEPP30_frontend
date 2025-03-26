// types/Search.ts
import { Dayjs } from 'dayjs';

export interface SearchOption {
  label: string;
  value: string;
}

export type SearchInputType = 'text' | 'select' | 'date' | 'dateTime' | 'time';

export interface InternalFormData {
  [key: string]: string | null | Dayjs | undefined;
}

export interface SearchDisplayProps {
  searchConfig: SearchConfig[];
  onSearch: (filters: SearchFields) => void;
  onClear: () => void;
  filters: SearchFields;
}

export interface SearchConfig {
  key: string;
  header: string;
  type: SearchInputType;
  placeholder?: string;
  options?: SearchOption[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Base Filter Fields with Date support
export interface FilterFields {
  camera_id?: string | null;
  floor?: string | null;
  zone?: string | null;
  status?: string | null;
  page?: number;
  limit?: number;
  log_id?: string | null;
  license_id?: string;
  province?: string;
  vehicle_color?: string;
  vehicle_brand?: string;
  row?: string | null;
  spot?: string | null;
  date_in?: string | Date;
  date_out?: string | Date;
  timestamp_in?: string | Date;
  timestamp_out?: string | Date;
  [key: string]: string | number | Date | null | undefined;
}

export type SearchFields = FilterFields;

// Processed Filters that includes Date support
export interface ProcessedFilters extends PaginationParams {
  camera_id?: string | null;
  floor?: string | null;
  zone?: string | null;
  status?: string | null;
  log_id?: string | null;
  license_id?: string;
  province?: string;
  vehicle_color?: string;
  vehicle_brand?: string;
  row?: string | null;
  spot?: string | null;
  date_in?: string | Date;
  date_out?: string | Date;
  timestamp_in?: string | Date;
  timestamp_out?: string | Date;
  [key: string]: string | number | Date | null | undefined;
}

export interface ZoneFilters extends Omit<ProcessedFilters, 'zone' | 'floor'> {
  zone: string;  // required
  floor: string; // required
}