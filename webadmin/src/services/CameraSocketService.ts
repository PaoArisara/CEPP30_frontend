// src/services/CameraSocketService.ts
import { BaseSocketService } from "./BaseSocketService";

class CameraSocketService extends BaseSocketService {
    constructor() {
        super('api/camera');  // ใส่ namespace ให้ตรงกับ backend
    }
}

export default new CameraSocketService();

