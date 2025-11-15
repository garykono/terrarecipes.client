import { AppErrorCode } from "./codes";

type Presentation = { title: string; message: string };

export const ERROR_CODE_MAP: Record<AppErrorCode, Presentation> = {
    NOT_LOGGED_IN:       { title: 'Account Only Feature',                message: 'You must be logged in to access this feature.' },
    NO_ID:               { title: 'Void ID',         message: 'No resource ID was specified.' },
    MISSING_LOADER_DATA: { title: 'Missing Loader Data', message: 'Failed to load a required resource from server.' },
    MISSING_PARAMETERS:  { title: 'Missing Required Parameters', message: 'One or more required parameters were not given.' },
    INVALID_PARAMETERS:  { title: 'Invalid Parameters', message: 'Invalid values were given for one or more parameters.' },
    INVALID_FIELDS:      { title: 'Invalid Fields Sent', message: 'Some fields sent with the request were rejected by the server.' },
    NETWORK:             { title: 'Connection Issue', message: 'Unable to reach the server. Please check your connection.' },
    HTTP_400:            { title: '400 Error.',      message: 'The request could not be processed.' },
    HTTP_401:            { title: '401 Error.',      message: 'Authorization failed.' },
    HTTP_403:            { title: '403 Error.',      message: 'Access was denied for the attempted request.' },
    HTTP_404:            { title: '404 Error.',      message: 'The requested resource or URL was not found.' },
    HTTP_409:            { title: '409 Error.',      message: 'There was a conflict with your request.' },
    HTTP_429:            { title: '429 Error.',      message: 'Too many requests have been sent.'},
    HTTP_500:            { title: '500 Error.',      message: 'There was an issue with the server.' },
    HTTP_503:            { title: '503 Error.',      message: 'The service is temporarily unavailable.' },
    UNKNOWN:             { title: 'Error',           message: 'Something went wrong!' },
};

export const HTTP_STATUS_TO_CODE: Partial<Record<number, AppErrorCode>> = {
    400: 'HTTP_400',
    401: 'HTTP_401',
    403: 'HTTP_403',
    404: 'HTTP_404',
    409: 'HTTP_409',
    429: 'HTTP_429',
    500: 'HTTP_500',
    503: 'HTTP_503',
};