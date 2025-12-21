/** Preconfigured Axios instance for API requests with credentials enabled. */

import axios from "axios";

const api = axios.create({
    baseURL: "",
    withCredentials: true
});

export default api;