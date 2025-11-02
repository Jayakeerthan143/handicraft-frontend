import axios from "axios";

const API = axios.create({
  baseURL: "https://handicraft-backend-azwn.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
