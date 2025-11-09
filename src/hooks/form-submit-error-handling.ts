import { FieldError } from "react-hook-form";

export interface ErrorMessageSetter {
    (name: string, error: FieldError, options?: { shouldFocus?: boolean }): void
}

export function useSetError(
        err: { 
            duplicate_fields?: string[];
            invalid_fields?: { name: string; message: string }[];
            status?: number;
        }, 
        setError: ErrorMessageSetter) {

    console.log(err)

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
        console.log(err);
        setError('root.other', err as FieldError)
    }
}

// export function useDuplicateFieldHandling(
//         err: { duplicate_fields: string[]}, 
//         setError: ErrorMessageSetter
//     ) {

//     // console.log(err);
        
//     err.duplicate_fields.forEach((field) => {
//         setError(field, { message: `This ${field} is already taken.`}, { shouldFocus: true })
//     })
//     // if (err.duplicate_fields.includes('username')) {                  
//     //     setError('username', { message: "Username is already taken." });
//     // }
//     // if (err.duplicate_fields.includes('email')) {
//     //     setError('email', { message: 'Email address is already in use.' });
//     // }
// }

// export function useInvalidFieldHandling(
//         err: { invalid_fields: { name: string, message: string }[]},
//         setError: ErrorMessageSetter
//     ) {

//     // console.log(err);

//     err.invalid_fields.forEach(field => {
//         let fieldName = field.name;
//         if (['ingredients', 'directions'].includes(field.name)) {
//             fieldName = `${field.name}.root`;
//         }
//         console.log(fieldName)
//         setError(fieldName, { message: field.message}, { shouldFocus: true })
//     });

//     // err.invalid_fields.map(invalid_field => {
//     //     if (invalid_field.name === 'username') {                  
//     //         setError('username', { message: invalid_field.message });
//     //     }
//     //     if (invalid_field.name === 'email') {                  
//     //         setError('email', { message: invalid_field.message });
//     //     } 
//     //     if (invalid_field.name === 'password') {                  
//     //         setError('password', { message: invalid_field.message });
//     //     } 
//     //     if (invalid_field.name === 'passwordConfirm') {                  
//     //         setError('passwordConfirm', { message: invalid_field.message });
//     //     } 
//     //     // Used in changePasswordPage
//     //     if (invalid_field.name === 'passwordCurrent') {                  
//     //         setError('passwordCurrent', { message: invalid_field.message });
//     //     } 
//     //     // Used in recipe create and edit
//     //     if (invalid_field.name === 'name') {
//     //         setError('name', { message: invalid_field.message });
//     //     }
//     //     if (invalid_field.name === 'description') {
//     //         setError('description', { message: invalid_field.message });
//     //     }
//     //     if (invalid_field.name === 'ingredients') {
//     //         setError('ingredients.root', { message: invalid_field.message });
//     //     }
//     // })
// }