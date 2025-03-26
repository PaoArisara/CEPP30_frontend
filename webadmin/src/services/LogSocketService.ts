import { BaseSocketService } from './BaseSocketService';

class LogSocketService extends BaseSocketService {
  constructor() {
    super('api/parkingrecord-log'); 
  }
}

export default new LogSocketService();