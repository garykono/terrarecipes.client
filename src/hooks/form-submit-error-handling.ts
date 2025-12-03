import { FieldError } from "react-hook-form";
import { log, logAPI } from "../utils/logger";

export interface ErrorMessageSetter {
    (name: string, error: FieldError, options?: { shouldFocus?: boolean }): void
}

export function useSetError(
        err: { 
            duplicate_fields?: string[];
            invalid_fields?: { name: string; message: string }[];
            status?: number;
            name?: string;
        }, 
        setError: ErrorMessageSetter
) {
    if (err.duplicate_fields) {
        err.duplicate_fields.forEach((field) => {
            setError(field,  { type: 'server', message: `This ${field} is already taken.`}, { shouldFocus: true })
        })
    } else if (err.invalid_fields) {
        err.invalid_fields.forEach(field => {
            let fieldName = field.name;
            if (['ingredients', 'directions', 'tags'].includes(field.name)) {
                fieldName = `${field.name}.root`;
            }
            setError(fieldName, { type: 'server', message: field.message}, { shouldFocus: true })
        });
    } else {
        logAPI.debug({err}, "unknown error")
        setError('root.other', err as FieldError)
    }
}