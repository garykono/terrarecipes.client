import { useState, useEffect } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signUp } from '../api/queries/usersApi';
import FormMessage from '../components/FormMessage';
import { isEmail } from '../utils/validation';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../hooks/form-submit-error-handling';

function SignUpPage () {
    const revalidator = useRevalidator();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, getValues, setValue, setError, clearErrors, reset, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                email: '',
                username: '',
                password: '',
                passwordConfirm: ''
            }
        });

    const [ accountCreated, setAccountCreated ] = useState(false);

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
                revalidator.revalidate();
                reset();
                setAccountCreated(true);
                // navigate('/');
            })
            .catch(err => {
                setAccountCreated(false);
                useSetError(err, setError as ErrorMessageSetter);
            });
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <form className="is-flex is-flex-direction-column is-align-items-center" onSubmit={handleSubmit(onSubmit)}>
                <h2 className="title is-2 is-spaced">Create Account</h2>
                <div className="field">
                    <div className="control">
                        <label className="label">Username</label>
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
                            <FormMessage message={errors.username.message} danger />
                        )}
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <label className="label">Email Address</label>
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
                            <FormMessage message={errors.email.message} danger />
                        )}
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <label className="label">Password</label>
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
                            <FormMessage message={errors.password.message} danger />
                        )}
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                            <label className="label">Retype Password</label>
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
                            Sign Up
                        </button>
                    </p>
                </div>
                {accountCreated && 
                    <FormMessage message={'Account successfully created!'} success />
                }
                {errors.root?.general?.message && (
                    <FormMessage message={errors.root.general.message} danger />
                )}
            </form>
    );
}

export default SignUpPage;