import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sunlight-archive-backend.onrender.com',
});

export default api;
