import axios from 'axios';

const ApiConfig = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export default ApiConfig;
