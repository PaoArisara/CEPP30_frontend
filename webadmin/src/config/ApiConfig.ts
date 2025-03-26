export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  socketURL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', 
  accessTokenExpiresIn: 900000 // 15 นาที (15 * 60 * 1000 มิลลิวินาที)
};
