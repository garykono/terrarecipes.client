import styles from './ChangePasswordPage.module.css';
import { useState, useEffect } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateUserPassword } from '../../api/queries/usersApi';
import FormMessage from '../../components/formMessage/FormMessage';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import { RootLoaderResult } from '../root/rootLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';

function ChangePasswordPage() {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;

    const { register, handleSubmit, watch, getValues, setValue, setError, clearErrors, formState: { errors } } = useForm({
        reValidateMode: "onSubmit",
        defaultValues: {
            currentPassword: '',
            password: '',
            passwordConfirm: ''
        }
    });

    const [successMessage, setSuccessMessage] = useState('');

    const currentPasswordValue = watch('currentPassword');
    const passwordValue = watch('password');
    const passwordConfirmValue = watch('passwordConfirm');

    useEffect(() => {
        clearErrors('root.general');
    }, [currentPasswordValue, passwordValue, passwordConfirmValue]);

    interface FormData {
        currentPassword: string;
        password: string;
        passwordConfirm: string;
    }

    const onSubmit = ({ currentPassword, password, passwordConfirm }: FormData) => {
        setSuccessMessage('');
        updateUserPassword(currentPassword, password, passwordConfirm)
            .then(() => {
                setValue('currentPassword', '');
                setValue('password', '');
                setValue('passwordConfirm', '');
                setSuccessMessage("Your password has been updated.");
            })
            .catch(err => {
                if (err.status === 401) {
                    setError('currentPassword', { message: 'The password you entered is incorrect.'})
                } else {
                    useSetError(err, setError as ErrorMessageSetter);
                }
                setSuccessMessage('');
                
            })
    };

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className="page-change-password">
            <div className="container">
                <form className={`form form--card ${styles.form}`} onSubmit={handleSubmit(onSubmit)}>
                    <h1 className='form-title'>Change My Password</h1>
                    <div className="field">
                    <label className="label">Current Password</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="password" 
                                {...register("currentPassword", {
                                    required: "Please enter your current password."
                                })}
                            />
                            {errors.currentPassword?.message && (
                                <FormMessage className='form-message' message={errors.currentPassword.message} danger />
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">New Password</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="password" 
                                {...register("password", {
                                    required: "Please enter your new password.",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters."
                                    },
                                    maxLength: {
                                        value: 30,
                                        message: "Password must be 30 characters or less."
                                    }
                                })}
                            />
                            {errors.password?.message && (
                                <FormMessage className='form-message' message={errors.password.message} danger />
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Confirm New Password</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="password" 
                                {...register("passwordConfirm", {
                                    required: "Please verify your password.",
                                    validate: {
                                        passwordMatch: (value) => {
                                            if (value !== getValues('password')) {
                                                return 'Passwords do not match.';
                                            }
                                        }
                                    }
                                })}
                            />
                            {errors.passwordConfirm?.message && (
                                <FormMessage className='form-message' message={errors.passwordConfirm.message} danger />
                            )}
                        </div>
                    </div>

                    <div className="field is-grouped m-2">
                        <p className="control">
                            <button className="button button--full" type="submit">
                                Submit
                            </button>
                        </p>
                    </div>
                    {successMessage !== '' &&
                        <FormMessage className='form-message' message={successMessage} success />
                    }
                    {errors.root?.general?.message &&
                        <FormMessage className='form-message' message={errors.root.general.message} danger />
                    }
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordPage;