import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/** Auth */
export const signup = (email: string, password: string) =>
  api.post('/api/auth/signup', { email, password });

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const logout = () =>
  api.post('/api/auth/logout');

export const googleSignup = (idToken: string) =>
  api.post('/api/auth/google/signup', { idToken });

export const googleLogin = (idToken: string) =>
  api.post('/api/auth/google/login', { idToken });

export const me = () =>
  api.get('/api/auth/me');

/** Protected */
export const fetchProtected = () =>
  api.get('/api/protected');

export default api;