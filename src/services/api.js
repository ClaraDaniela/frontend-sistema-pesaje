import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
});

api.interceptors.request.use((config) => {
  try {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser?.token) {
        config.headers.set("Authorization", `Bearer ${parsedUser.token}`);
      }
    }
  } catch (error) {
    console.error("No se pudo leer la sesión guardada", error);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("user");
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default api;