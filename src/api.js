import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sunlight-archive-backend-4zoi.onrender.com',
});

export default api;
