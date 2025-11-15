import axios from "axios";
import { logAPI } from "./logger";
import { AppErrorCode, AppErrorCodes } from "./errors/codes";
import { HTTP_STATUS_TO_CODE } from "./errors/errorCodeMaps";
import { createAppError } from "./errors/factory";

const serverURL = import.meta.env.VITE_ENV === 'development'? 
    import.meta.env.VITE_LOCAL_SERVER_BASE_URL : import.meta.env.VITE_HOSTED_SERVER_BASE_URL;

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
        const start = performance.now();
        const dur = Math.round(performance.now() - start);
        const method = (response.config.method || 'get').toUpperCase();
        const url = response.request?.responseURL
            ? new URL(response.request.responseURL).pathname + (new URL(response.request.responseURL).search || '')
            : (response.config.url || '');
        const bytes = typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data || {}).length

        logAPI.debug(`${method} ${url} ${response.status} OK dur=${dur}ms bytes=${bytes}`, {
            status: response.status,
            dur,
            url,
            method,
            bytes,
            response
        });
        // Do something with response data
        return response;
    },
    (error) => {
        // if (error.code && error.code === 'ERR_NETWORK') {
        //     error.name = 'NETWORK_ERROR';
        //     error.status = 503;
        // } else if (error.response?.data?.name) {
        //     error.name = error.response?.data?.name;
        //     if (error.name === 'DUPLICATE_FIELD_ERROR') {
        //         error.duplicate_fields = error.response.data.errors.map((errMessage: string) => errMessage.split(':')[0].trim())
        //     } else if (error.name === 'VALIDATION_ERROR') {
        //         error.invalid_fields = error.response.data.errors.map((errMessage: string) => {
        //             return {
        //                 name: errMessage.split(':')[0],
        //                 message: errMessage.split(':')[1]
        //             }
        //         })
        //     }
        // }
        // 1) Parse and normalize values from the response
        const cfg = error.config || {};
        const start = performance.now();
        const dur = Math.round(performance.now() - start);
        const method = (cfg.method || 'get').toUpperCase();
        const url = cfg.url || '';
        const status = error.response?.status ?? error.status;
        const isNetwork = !!error.code && !status;
        const serverPayload = error.response?.data;
        const additionalInfo = serverPayload.additionalInfo;

        let code: AppErrorCode = isNetwork 
            ? AppErrorCodes.NETWORK :
            (status ? (HTTP_STATUS_TO_CODE[status] ?? AppErrorCodes.UNKNOWN) : AppErrorCodes.UNKNOWN);

        // 2) Do additional normalizing for specific errors
        const duplicateFields = serverPayload.response?.data?.name === 'DUPLICATE_FIELD_ERROR'
            ? error.response.data.errors.map((errMessage: string) => errMessage.split(':')[0].trim())
            : undefined;

        const invalidFields = serverPayload.response?.data?.name === 'VALIDATION_ERROR'
        ? error.response.data.errors.map((errMessage: string) => {
                return {
                    name: errMessage.split(':')[0],
                    message: errMessage.split(':')[1]
                }
            })
        : undefined;

        const appErr = createAppError({
            code,
            status,
            details: {
                originalCode: error.code,
                server: serverPayload,
                duplicateFields,
                invalidFields,
                additionalInfo,
                method, 
                url, 
                dur,
            },
        });


        // 3) Log the error
        const msg = isNetwork ? `${error.code}` : `${status} ${error.statusText || ''}`.trim();

        const logPayload = {
            method,
            url,
            status,
            dur,
            // Avoid dumping full response/request; add small, safe snippets only
            errMsg: error.message,
            respErr: error.response?.data?.error || error.response?.data?.message,
        };

        if (status && status < 500) {
            logAPI.warn(`${method} ${url} ${msg} dur=${dur}ms`, logPayload);
        } else {
            logAPI.error(`${method} ${url} ${msg || 'ERROR'} dur=${dur}ms`, logPayload);
        }

        // 4) Push the normalized error through to be caught and displayed by site
        return Promise.reject(appErr);
    }
);

export default axiosInstance;