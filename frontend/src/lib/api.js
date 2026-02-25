import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
};

// ─── Movies ───
export const moviesApi = {
    getAll: (params) => api.get('/movies', { params }),
    getOne: (id) => api.get(`/movies/${id}`),
    create: (data) => api.post('/movies', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/movies/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/movies/${id}`),
    getOmdbPreview: (query) => api.get(`/movies/omdb/search`, { params: { q: query } }),
    getOmdbSuggestions: (query) => api.get(`/movies/omdb/suggestions`, { params: { q: query } }),
    getComments: (id) => api.get(`/movies/${id}/comments`),
    addComment: (id, text) => api.post(`/movies/${id}/comments`, { text }),
    deleteComment: (commentId) => api.delete(`/movies/comments/${commentId}`),
};

// ─── User ───
export const userApi = {
    getFavorites: () => api.get('/users/favorites'),
    addFavorite: (movieId) => api.post(`/users/favorites/${movieId}`),
    removeFavorite: (movieId) => api.delete(`/users/favorites/${movieId}`),
    getRatings: () => api.get('/users/ratings'),
    rateMovie: (movieId, score) => api.post(`/users/ratings/${movieId}`, { score }),
    deleteRating: (movieId) => api.delete(`/users/ratings/${movieId}`),
    getHistory: () => api.get('/users/history'),
    addHistory: (movieId) => api.post(`/users/history/${movieId}`),
};


