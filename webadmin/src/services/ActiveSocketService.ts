// services/ActiveSocketService.ts
import { BaseSocketService } from './BaseSocketService';

class ActiveSocketService extends BaseSocketService {
  constructor() {
      super('api/parkingrecord-active');  // ใส่ namespace ให้ตรงกับ backend
  }
}

export default new ActiveSocketService();
