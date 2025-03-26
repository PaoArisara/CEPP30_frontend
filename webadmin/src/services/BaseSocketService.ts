import { io, Socket, ManagerOptions, SocketOptions as IOSocketOptions } from 'socket.io-client';
import { API_CONFIG } from '../config/ApiConfig';
import { AuthService } from './AuthenService';

interface SocketOptions {
  debug?: boolean;
  forceRefresh?: boolean; // เพิ่มตัวเลือกสำหรับบังคับ refresh connection
}

export class BaseSocketService {
  private socket: Socket | null = null;
  private namespace: string;
  private options: SocketOptions = { debug: false };
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private pingInterval: number | null = null;
  private autoReconnectTimer: number | null = null;
  private isReconnecting: boolean = false;

  constructor(namespace: string) {
    this.namespace = namespace;
    // เพิ่ม event listeners สำหรับการจัดการเมื่อเปลี่ยนสถานะ online/offline
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    // เพิ่ม event listener สำหรับเมื่อ document กลับมาถูกมองเห็น (user กลับมาที่แท็บ)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private connectionTimeout: number = 10000; // เพิ่มเป็น 10 วินาทีเพื่อรองรับเครือข่ายที่ช้า

  // Handler เมื่อ browser กลับมา online
  private handleOnline = () => {
    console.log(`[${this.namespace}] Browser back online, attempting to reconnect`);
    this.attemptReconnect();
  }

  // Handler เมื่อ browser offline
  private handleOffline = () => {
    console.log(`[${this.namespace}] Browser went offline, pausing reconnection attempts`);
    this.stopPingInterval();
    this.clearAutoReconnectTimer();
  }

  // Handler เมื่อ user กลับมาที่แท็บ
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log(`[${this.namespace}] Tab became visible, checking connection status`);
      if (!this.isConnected()) {
        this.attemptReconnect();
      } else {
        // ถ้ายังเชื่อมต่ออยู่ แต่อาจจะมีปัญหากับ token ให้ลองตรวจสอบและรีเฟรช token
        this.checkAndRefreshToken();
      }
    }
  }

  // เพิ่มฟังก์ชันสำหรับตรวจสอบและรีเฟรช token หากจำเป็น
  private async checkAndRefreshToken() {
    const token = AuthService.getAccessToken();
    if (!token) return;
    
    try {
      // ตรวจสอบว่า token ใกล้หมดอายุหรือไม่
      const isTokenExpiring = this.isTokenExpiring(token);
      if (isTokenExpiring) {
        console.log(`[${this.namespace}] Token is expiring soon, refreshing`);
        const refreshToken = AuthService.getRefreshToken();
        if (refreshToken) {
          await AuthService.refreshToken(refreshToken);
          console.log(`[${this.namespace}] Token refreshed, reconnecting socket`);
          this.connect({ forceRefresh: true });
        }
      }
    } catch (error) {
      console.error(`[${this.namespace}] Token refresh error:`, error);
    }
  }

  // ตรวจสอบว่า token ใกล้หมดอายุหรือไม่
  private isTokenExpiring(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;
      
      // Token จะหมดอายุภายใน 5 นาที
      return timeLeft < 5 * 60 * 1000;
    } catch (e) {
      console.error(`[${this.namespace}] Error checking token expiration:`, e);
      return true; // ถ้ามีข้อผิดพลาดให้ถือว่าควร refresh
    }
  }

  // พยายามเชื่อมต่อใหม่
  private attemptReconnect() {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    this.reconnectAttempts = 0;
    
    const attemptConnect = async () => {
      try {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log(`[${this.namespace}] Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
          this.isReconnecting = false;
          return;
        }
        
        this.reconnectAttempts++;
        console.log(`[${this.namespace}] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        // ตรวจสอบและรีเฟรช token ก่อนเชื่อมต่อใหม่
        await this.checkAndRefreshToken();
        
        this.connect({ forceRefresh: true });
        
        // ถ้าเชื่อมต่อสำเร็จ
        if (this.isConnected()) {
          console.log(`[${this.namespace}] Reconnection successful`);
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
        } else {
          // ถ้าเชื่อมต่อไม่สำเร็จ ให้ลองอีกครั้งโดยเพิ่มเวลารอขึ้นเรื่อยๆ
          const delay = Math.min(30000, Math.pow(1.5, this.reconnectAttempts) * 1000);
          console.log(`[${this.namespace}] Connection failed, retrying in ${Math.round(delay / 1000)}s`);
          
          this.clearAutoReconnectTimer();
          this.autoReconnectTimer = window.setTimeout(attemptConnect, delay);
        }
      } catch (error) {
        console.error(`[${this.namespace}] Reconnection error:`, error);
        this.isReconnecting = false;
        
        // ถ้ามีข้อผิดพลาด ลองใหม่หลังจาก 5 วินาที
        this.clearAutoReconnectTimer();
        this.autoReconnectTimer = window.setTimeout(attemptConnect, 5000);
      }
    };
    
    // เริ่มการเชื่อมต่อใหม่ทันที
    attemptConnect();
  }
  
  // ล้าง auto reconnect timer
  private clearAutoReconnectTimer() {
    if (this.autoReconnectTimer) {
      window.clearTimeout(this.autoReconnectTimer);
      this.autoReconnectTimer = null;
    }
  }

  connect(options: SocketOptions = {}): Socket {
    this.options = { ...this.options, ...options };
    
    // ถ้ามี forceRefresh จะทำการ disconnect ก่อนเสมอ
    if (this.options.forceRefresh && this.socket) {
      console.log(`[${this.namespace}] Forcing refresh of connection`);
      this.disconnect();
    }

    if (this.socket?.connected && !this.options.forceRefresh) {
      console.log(`[${this.namespace}] Reusing existing connection`);
      return this.socket;
    }

    if (this.socket) {
      console.log(`[${this.namespace}] Cleaning up existing socket`);
      this.disconnect();
    }

    const token = AuthService.getAccessToken();
    if (!token) {
      console.error(`[${this.namespace}] No access token found`);
      throw new Error('No access token found');
    }

    console.log(`[${this.namespace}] Connecting to ${API_CONFIG.socketURL}/${this.namespace}`);

    // สร้าง socket options ที่รองรับทั้ง options ของ manager และ socket
    const socketOptions: Partial<ManagerOptions & IOSocketOptions> = {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // เพิ่ม polling เพื่อรองรับ fallback
      auth: { token },
      extraHeaders: {
          Authorization: `Bearer ${token}`
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: this.connectionTimeout,
      forceNew: options.forceRefresh === true
    };

    this.socket = io(`${API_CONFIG.socketURL}/${this.namespace}`, socketOptions);

    // เพิ่มการตรวจสอบ token timeout
    const connectionTimer = window.setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        console.log(`[${this.namespace}] Connection timeout after ${this.connectionTimeout}ms`);
        this.socket.close();
        this.socket = null;
      }
    }, this.connectionTimeout);

    this.socket.on('connect', () => {
      window.clearTimeout(connectionTimer);
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      
      // เริ่ม ping เพื่อให้ connection ยังคงอยู่
      this.startPingInterval();
    });

    this.setupListeners();
    return this.socket;
  }

  // เริ่มการส่ง ping เพื่อรักษาการเชื่อมต่อ
  private startPingInterval() {
    this.stopPingInterval(); // ล้าง interval เดิมก่อน
    
    // ส่ง ping ทุก 4 นาที เพื่อรักษาการเชื่อมต่อ
    this.pingInterval = window.setInterval(() => {
      if (this.socket?.connected) {
        console.log(`[${this.namespace}] Sending ping to keep connection alive`);
        this.socket.emit('ping', null, (response: any) => {
          if (response) {
            console.log(`[${this.namespace}] Received pong`);
          }
        });
      } else {
        console.log(`[${this.namespace}] Connection lost, attempting to reconnect`);
        this.attemptReconnect();
      }
    }, 4 * 60 * 1000);
  }

  // หยุดการส่ง ping
  private stopPingInterval() {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  emit(event: string, data: any, callback?: (response: any) => void) {
    if (!this.socket?.connected) {
      console.error(`[${this.namespace}] Cannot emit '${event}': Socket not connected`);
      // แทนที่จะ throw error ให้ลองเชื่อมต่อใหม่
      this.attemptReconnect();
      throw new Error(`Socket ${this.namespace} not connected`);
    }
    if (this.options.debug) {
      console.log(`[${this.namespace}] Emitting '${event}'`, data);
    }
    this.socket.emit(event, data, callback);
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(`[${this.namespace}] Socket connected`);
      if (this.options.debug) {
        console.log(`[${this.namespace}] Connection details:`, {
          id: this.socket?.id,
          connected: this.socket?.connected,
          auth: this.socket?.auth
        });
      }
    });

    this.socket.on('connect_error', async (error) => {
      console.error(`[${this.namespace}] Connection error:`, error);
      if (error.message.includes('authentication') || error.message.includes('jwt')) {
        console.log(`[${this.namespace}] Authentication error, attempting to refresh token`);
        
        try {
          // พยายาม refresh token
          const refreshToken = AuthService.getRefreshToken();
          if (refreshToken) {
            const result = await AuthService.refreshToken(refreshToken);
            if (result) {
              console.log(`[${this.namespace}] Token refreshed, reconnecting socket`);
              this.connect({ forceRefresh: true });
              return;
            }
          }
          
          // ถ้าไม่สามารถ refresh token ได้ ให้ logout
          console.log(`[${this.namespace}] Authentication failed and couldn't refresh token, logging out`);
          AuthService.logout();
        } catch (err) {
          console.error(`[${this.namespace}] Error refreshing token:`, err);
          AuthService.logout();
        }
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[${this.namespace}] Disconnected:`, reason);
      
      // หยุด ping interval
      this.stopPingInterval();
      
      if (reason === 'io server disconnect') {
        console.log(`[${this.namespace}] Server forced disconnect, attempting to reconnect`);
        this.attemptReconnect();
      } else if (reason === 'io client disconnect') {
        // ถูกตัดการเชื่อมต่อโดยไคลเอนต์เอง (เช่น จากการเรียก disconnect())
        console.log(`[${this.namespace}] Client initiated disconnect`);
      } else {
        // กรณีอื่นๆ เช่น transport close, ping timeout
        console.log(`[${this.namespace}] Connection lost (${reason}), attempting to reconnect`);
        this.attemptReconnect();
      }
    });

    // เพิ่ม listener สำหรับ error ทั่วไป
    this.socket.on('error', (error) => {
      console.error(`[${this.namespace}] Socket error:`, error);
    });

    // เพิ่ม listener สำหรับ pong จากเซิร์ฟเวอร์
    this.socket.on('pong', () => {
      if (this.options.debug) {
        console.log(`[${this.namespace}] Received pong from server`);
      }
    });
  }

  disconnect() {
    this.stopPingInterval();
    this.clearAutoReconnectTimer();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      this.connect();
    }
    
    if (!this.socket?.connected) {
      console.warn(`[${this.namespace}] Socket not connected when adding listener for '${event}', will attempt reconnect`);
      this.attemptReconnect();
    }
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getInstance(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // เพิ่ม cleanup method สำหรับเรียกใช้เมื่อ component unmount
  cleanup() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.stopPingInterval();
    this.clearAutoReconnectTimer();
    this.disconnect();
  }
}