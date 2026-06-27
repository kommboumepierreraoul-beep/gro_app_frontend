import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
 baseURL: 'http://localhost:8000/api',
    headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
    },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Intercepteur response simplifié — axios parse déjà le JSON automatiquement
api.interceptors.response.use(
    (response) => response,  // ← ne touche plus à response.data
    (error) => Promise.reject(error)
);

export default api;