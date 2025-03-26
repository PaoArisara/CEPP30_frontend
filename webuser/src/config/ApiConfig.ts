import axios from 'axios';

const ApiConfig = axios.create({
    baseURL: 'http://localhost:3000', // URL พื้นฐานของ API
});

export default ApiConfig;
