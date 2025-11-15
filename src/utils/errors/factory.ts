import { AppErrorCode } from './codes';
import { ERROR_CODE_MAP } from './errorCodeMaps';
import { AppError } from './types';

export function createAppError(input: {
    code: AppErrorCode;
    message?: string;
    status?: number;
    title?: string;
    userMessage?: string; // message is user message for now
    details?: unknown;
}): AppError {
    const e = new Error(input.message || ERROR_CODE_MAP[input.code].message) as AppError;
    e.code = input.code;
    e.status = input.status;
    e.title = input.title ?? ERROR_CODE_MAP[input.code].title;
    e.details = input.details;
    return e;
}

export function isAppError(e: unknown): e is AppError {
    return typeof e === 'object' && e !== null && 'code' in e;
}