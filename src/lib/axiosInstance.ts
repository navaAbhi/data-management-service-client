import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            await axios.post("/verify-token", {}, {
                baseURL: "http://localhost:8000",
                withCredentials: true
            });
        } catch (error) {
            console.error("Token verification failed:", error);
            // optionally: clear local state, redirect, etc
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
