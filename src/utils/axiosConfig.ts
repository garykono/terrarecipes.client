import axios from "axios";

const serverURL = import.meta.env.VITE_SERVER_BASE_URL;

const axiosInstance = axios.create({
    baseURL: serverURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        //Do something before the request is sent
        return config;
    },
    (error) => {
        //Do something with the request error
        
        return Promise.reject(error);
    }
)

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Do something with response data
        return response;
    },
    (error) => {
        if (error.code && error.code === 'ERR_NETWORK') {
            error.name = 'NETWORK_ERROR';
            error.status = 503;
        } else if (error.response?.data?.name) {
            error.name = error.response?.data?.name;
            if (error.name === 'DUPLICATE_FIELD_ERROR') {
                error.duplicate_fields = error.response.data.errors.map((errMessage: string) => errMessage.split(':')[0].trim())
            } else if (error.name === 'VALIDATION_ERROR') {
                error.invalid_fields = error.response.data.errors.map((errMessage: string) => {
                    return {
                        name: errMessage.split(':')[0],
                        message: errMessage.split(':')[1]
                    }
                })
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;