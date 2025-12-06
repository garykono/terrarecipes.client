import { FieldError } from "react-hook-form";
import { log, logAPI } from "../utils/logger";

export interface ErrorMessageSetter {
    (name: string, error: FieldError, options?: { shouldFocus?: boolean }): void
}

export function useSetError(
        err: {
            status?: number;
            details: { 
                duplicateFields?: string[];
                invalidFields?: { name: string; message: string }[];
            }
        }, 
        setError: ErrorMessageSetter
) {
    if (err.details.duplicateFields) {
        err.details.duplicateFields.forEach((field) => {
            setError(field,  { type: 'server', message: `This ${field} is already taken.`}, { shouldFocus: true })
        })
    } else if (err.details.invalidFields) {
        err.details.invalidFields.forEach(field => {
            let fieldName = field.name;
            if (['ingredients', 'directions', 'tags'].includes(field.name)) {
                fieldName = `${field.name}.root`;
            }
            setError(fieldName, { type: 'server', message: field.message}, { shouldFocus: true })
        });
    } else {
        logAPI.debug({err}, "unknown error")
        setError('root.other', {
            type: 'server',
            message: 'Something went wrong. Please try again.',
        })
    }
}