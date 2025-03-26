import { Pagination } from "./Common";

// types/Camera.ts
export type CameraStatus = 'ปกติ' | 'ชำรุด' | 'ไม่ได้ใช้งาน' | 'รอดำเนินการ';

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

export interface CameraResponse {
  data: Camera[];
  meta: Pagination
}

export interface CameraHistory {
  camera_history_id: string;  // เพิ่มฟิลด์นี้
  camera_id: string;
  event_time: Date,
  action: string;
  old_status: string;
  new_status: string;
  note: string;
  changed_by: string;
}

export interface HistoryResponse {
  data: CameraHistory[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  }
}

export interface Status {
  active: number;
  broken: number;
  waiting: number;
}

export interface CategoryData {
  total: number;
  status: Status;
}

export interface CameraCount {
  [key: string]: {
    [key: string]: CategoryData;
  };
}