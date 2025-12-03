import clsx from 'clsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './SignUpPage.module.css';
import { signUp } from '../../api/queries/usersApi';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import Button from '../../components/buttons/Button';
import { isEmail } from '../../utils/validation';

export default function SignUpPage () {
    const navigate = useNavigate();

    const { register, handleSubmit, watch, getValues, setValue, setError, clearErrors, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                email: '',
                username: '',
                password: '',
                passwordConfirm: ''
            }
        });

    const usernameValue = watch('username');
    const emailValue = watch('email');
    const passwordValue = watch('password');
    const passwordConfirmValue = watch('passwordConfirm');

    useEffect(() => {
        clearErrors('root.general');
    }, [usernameValue, emailValue, passwordValue, passwordConfirmValue]);

    interface FormData {
        username: string;
        email: string;
        password: string;
        passwordConfirm: string;
    }

    const onSubmit = ({ username, email, password, passwordConfirm }: FormData) => {
        signUp(username, email, password, passwordConfirm)
            .then(() => {
                // revalidator.revalidate();
                // reset();
                navigate("/verificationSent", { state: { email } });
            })
            .catch(err => {
                useSetError(err, setError as ErrorMessageSetter);
            });
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className={styles.pageSignup}>
            <div className="container">
                <div className={styles.signUp}>
                    <form 
                        className={clsx(
                            "form",
                            "card",
                            "card--form",
                            styles.form,
                            styles.formSignup
                        )} 
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="form-heading">
                            <h1 className={"form-title"}>Create an Account</h1>
                        </div>
                        <div className={clsx(
                            "field",
                            styles.field
                        )}>
                            <label className="label">Username</label>
                            <div className="control">
                                <input 
                                    className="input" 
                                    type="username" 
                                    {...register("username", {
                                        required: "Must provide a username.",
                                        minLength: {
                                            value: 3,
                                            message: "Username must be at least 3 characters."
                                        },
                                        maxLength: {
                                            value: 20,
                                            message: "Username must be 20 characters or less."
                                        }
                                    })}
                                />
                                {errors.username?.message && (
                                    <FormMessage className="form-message" message={errors.username.message} danger />
                                )}
                            </div>
                        </div>
                        <div className={clsx(
                            "field",
                            styles.field
                        )}>
                            <label className="label">Email Address</label>
                            <div className="control">
                                <input 
                                    className="input" 
                                    type="text" 
                                    {...register("email", {
                                        required: "An email address is required.",
                                        validate: {
                                            isEmail: (value) => {
                                                if (!isEmail(value)) return 'Must provide a valid email address.';
                                            }
                                        }
                                    })}
                                />
                                {errors.email?.message && (
                                    <FormMessage className="form-message" message={errors.email.message} danger />
                                )}
                            </div>
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
                        <div className={clsx(
                        "field",
                        styles.field
                    )}>
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
                        <div className={clsx(
                            "field",
                            styles.field
                        )}>
                            <p className="control">
                                <Button primary className={styles.signupButton} type="submit">Sign Up</Button>
                            </p>
                        </div>
                        {errors.root?.general?.message && (
                            <FormMessage className="form-message" message={errors.root.general.message} danger />
                        )}
                    </form>

                    <div className={styles.signupImage} role="img" aria-label="vegetable platter"></div>
                </div>
            </div>
        </div>
    );
}