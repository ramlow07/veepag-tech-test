import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Response interceptor — normalise error shape
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message: string =
      err?.response?.data?.message ?? err?.message ?? 'Unexpected error';
    return Promise.reject(new Error(Array.isArray(message) ? message.join('; ') : message));
  },
);

export default client;
