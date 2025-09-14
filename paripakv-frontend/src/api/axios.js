import axios from "axios";

const instance = axios.create({
<<<<<<< HEAD
    baseURL: "http://localhost:8089",
=======
    baseURL: import.meta.env.VITE_API_URL,
>>>>>>> new-feature
    headers: {
        "Content-Type": "application/json",
    },
});

export default instance;
