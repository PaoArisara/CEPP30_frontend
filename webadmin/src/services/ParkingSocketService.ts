import { WebSocketResponse } from "../types/Common";
import { BaseSocketService } from "./BaseSocketService";

// services/ParkingSocketService.ts
class ParkingSocketService extends BaseSocketService {
  private static instance: ParkingSocketService;

  constructor() {
    super('api/parking');
  }

  static getInstance(): ParkingSocketService {
    if (!ParkingSocketService.instance) {
      ParkingSocketService.instance = new ParkingSocketService();
    }
    return ParkingSocketService.instance;
  }

  async getSlotAll(params: {
    map?: string;
    floor?: string;
  }): Promise<WebSocketResponse<any>> {
    return new Promise((resolve, reject) => {
      try {
        this.emit('getSlotAll', params, (response: WebSocketResponse<any>) => {
          resolve(response);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getFloorCounts(params: { zone?: string }): Promise<WebSocketResponse<any>> {
    return new Promise((resolve, reject) => {
      try {
        this.emit('getFloorCounts', params, (response: WebSocketResponse<any>) => {
          resolve(response);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new ParkingSocketService();