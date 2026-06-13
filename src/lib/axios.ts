import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
    },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    console.log('=== INTERCEPTEUR ===');
    console.log('Token lu depuis cookie:', token ? token.substring(0, 20) + '…' : 'NULL ❌');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use((response) => {
    if (typeof response.data === 'string') {
        try {
            const cleaned = response.data.replace(/^[^{[]*/, '').trim();
            response.data = JSON.parse(cleaned);
        } catch (e) {
            console.error('Parse error', e);
        }
    }
    return response;
});

export default api;