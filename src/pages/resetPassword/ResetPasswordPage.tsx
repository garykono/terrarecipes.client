import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './ResetPasswordPage.module.css';
import { ResetPasswordLoaderResult } from './ResetPasswordLoader';
import { resetPassword } from '../../api/queries/usersApi';
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import Button from '../../components/buttons/Button';

export default function SignUpPage () {
    const { token } = useLoaderData() as ResetPasswordLoaderResult;

    const { register, handleSubmit, watch, getValues, setValue, setError, clearErrors, reset, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                password: "",
                passwordConfirm: ""
            }
        });

    const [ successMessage, setSuccessMessage ] = useState("");

    const passwordValue = watch('password');
    const passwordConfirmValue = watch('passwordConfirm');

    useEffect(() => {
        clearErrors('root.general');
    }, [passwordValue, passwordConfirmValue]);

    interface FormData {
        password: string;
        passwordConfirm: string;
    }

    const onSubmit = ({ password, passwordConfirm }: FormData) => {
        resetPassword(password, passwordConfirm, token!)
            .then(() => {
                reset();
                setSuccessMessage("Your password has been reset!");
            })
            .catch(err => {
                if (err.name === "INVALID_TOKEN") {
                    setSuccessMessage("");
                    setError('root.general', { message: "Password reset link invalid or expired." });
                } else {
                    setError('root.other', err);
                }
            });
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className={styles.pageResetPassword}>
            <div className="container">
                <div className={styles.formContainer}>
                    <form 
                        className={clsx(
                            "form",
                            "card",
                            "card--form",
                            styles.form,
                            styles.formResetPassword
                        )} 
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="form-heading">
                            <h1 className={"form-title"}>Reset Password</h1>
                        </div>
                        <div className={clsx(
                            "field",
                            styles.field
                        )}>
                            <label className="label">Password</label>
                            <div className="control">
                                <input 
                                    className="input" 
                                    type="password" 
                                    {...register("password", {
                                        required: "Must provide a password.",
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
                                    <FormMessage className="form-message" message={errors.password.message} danger />
                                )}
                            </div>
                        </div>
                        <div className={`field ${styles.field}`}>
                            <label className="label">Retype Password</label>
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
                                        <FormMessage className="form-message" message={errors.passwordConfirm.message} danger />
                                    )}
                            </div>
                        </div>
                        <div className={styles.submitButtons}>
                            <Button primary type="submit">Submit</Button>
                        </div>
                        {successMessage !== '' &&
                            <FormMessage message={successMessage} className={styles.formMessage} success />
                        }
                        {errors.root?.general?.message && (
                            <FormMessage message={errors.root.general.message} className={styles.formMessage} danger />
                        )}
                    </form>
                </div>
                    
            </div>
        </div>
    );
}