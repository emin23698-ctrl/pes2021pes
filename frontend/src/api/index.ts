// src/api/index.ts
import axios from 'axios';

// Vite projelerinde ortam değişkenlerine bu şekilde erişilir
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

export default api;