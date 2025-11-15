import { AppErrorCode } from "./codes";

export interface AppError extends Error {
    status?: number;
    code: AppErrorCode;
    title?: string;
    userMessage?: string;   // safe for UI
    details?: unknown;      // raw server payload, safe to log only
}