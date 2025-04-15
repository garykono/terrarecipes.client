import { useState, useEffect } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateUserPassword } from '../api/queries/usersApi';
import FormMessage from '../components/FormMessage';
import { ErrorMessageSetter, useSetError } from '../hooks/form-submit-error-handling';
import { RootLoaderResult } from './root/rootLoader';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';

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
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="section is-flex is-flex-direction-column is-align-items-center">
                <h2 className="title is-2 is-spaced">Change My Password</h2>
            </div>
            <section className="section column is-4">
                <div className="is-flex is-flex-direction-column">

                    <div className="field">
                        <div className="control">
                            <label className="label">Current Password</label>
                            <input 
                                className="input" 
                                type="password" 
                                {...register("currentPassword", {
                                    required: "Please enter your current password."
                                })}
                            />
                            {errors.currentPassword?.message && (
                                <FormMessage message={errors.currentPassword.message} danger />
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <div className="control">
                            <label className="label">New Password</label>
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
                                <FormMessage message={errors.password.message} danger />
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <div className="control">
                                <label className="label">Confirm New Password</label>
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
                                    <FormMessage message={errors.passwordConfirm.message} danger />
                                )}
                        </div>
                    </div>

                    <div className="field is-grouped m-2">
                        <p className="control">
                            <button className="button my-color-bg" type="submit">
                                Submit
                            </button>
                        </p>
                    </div>
                    {successMessage !== '' &&
                        <FormMessage message={successMessage} success />
                    }
                    {errors.root?.general?.message &&
                        <FormMessage message={errors.root.general.message} danger />
                    }
                </div>
            </section>
        </form>
    );
}

export default ChangePasswordPage;