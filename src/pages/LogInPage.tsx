import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useRevalidator } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { logIn } from '../api/queries/usersApi';
import FormMessage from '../components/FormMessage';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';
import { isEmail } from '../utils/validation';

function LogInPage () {
    const revalidator = useRevalidator();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    useEffect(() => {
        clearErrors('root.general');
    }, [emailValue, passwordValue])

    interface FormData {
        email: string;
        password: string;
    }

    const onSubmit = ({ email, password }: FormData) => {
        logIn(email, password)
            .then(() => {
                revalidator.revalidate();
                navigate('/')
            })
            .catch((err) => {
                // Backend doesn't do validation check on email or password
                if (err.status === 401) {
                    setError("root.general", { message:'There is no account with that email and password.'})
                } 
                else {
                    console.log(err);
                    setError('root.other', err);
                    // setError("general", { message:'Something went wrong with the log in attempt.'})
                }
            })  
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <form 
            className="is-flex is-flex-direction-column is-align-items-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2 className="title is-2 is-spaced">Log In</h2>

            <div className="field">
                <label className="label">Email</label>
                <div className="control">
                    <input 
                        className="input" 
                        type="text" 
                        {...register("email", {
                            required: "Email is required.",
                            validate: {
                                isEmail: (value) => {
                                    if (!isEmail(value)) return 'Must provide a valid email address.';
                                }
                            }
                        })}
                    />
                    {errors.email?.message && (
                        <FormMessage message={errors.email?.message} danger />
                    )}
                </div>
            </div>

            <div className="field">
                <label className="label">Password</label>
                <div className="control">
                    <input 
                        className="input" 
                        type="password" 
                        {...register("password", {
                            required: "Password is required."
                        })}
                    />
                    {errors.password?.message && (
                        <FormMessage message={errors.password?.message} danger />
                    )}
                </div>
            </div>

            {errors.root?.general?.message && (
                <FormMessage message={errors.root.general.message} danger />
            )}

            <div className="field is-grouped m-2">
                <div className="control">
                    <button type="submit" className="button my-color-bg">
                        Login
                    </button>
                </div>
                <Link to="/signUp" className="button is-light">
                    Sign Up
                </Link>
            </div>

            <div className="field mt-3">
                <div className="control">
                    <Link to='/forgotPassword'>
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </form>
    );
}

export default LogInPage;