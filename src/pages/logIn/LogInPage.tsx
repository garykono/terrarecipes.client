import clsx from 'clsx';
import { useEffect } from 'react';
import { Link, useNavigate, useRevalidator } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './LogInPage.module.css';
import { logIn } from '../../api/queries/usersApi';
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import Button from '../../components/buttons/Button';
import { isEmail } from '../../utils/validation';

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
            .then((user) => {
                if (!user.verifiedAt) {
                    revalidator.revalidate();
                    navigate('/verificationRequired', { state: { email, fromLogin: true } })
                } else {
                    revalidator.revalidate();
                    navigate('/')
                }
            })
            .catch((err) => {
                // Backend doesn't do validation check on email or password
                if (err.status === 401) {
                    setError("root.general", { message:'There is no account with that email and password.'})
                } 
                else {
                    setError('root.other', err);
                    // setError("general", { message:'Something went wrong with the log in attempt.'})
                }
            })  
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className={styles.pageLogin}>
            <div className="container">
                <div className={styles.formContainer}>
                    <form 
                        className={clsx(
                            "form",
                            "card",
                            "card--form",
                            styles.formLogin
                        )}
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className='form-heading'>
                            <h1 className={"form-title"}>Log In</h1>
                        </div>

                        <div className={clsx(
                            "field",
                            styles.field
                        )}>
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
                                    <FormMessage className="form-message" message={errors.email?.message} danger />
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
                                        required: "Password is required."
                                    })}
                                />
                                {errors.password?.message && (
                                    <FormMessage className="form-message" message={errors.password?.message} danger />
                                )}
                            </div>
                        </div>

                        {errors.root?.general?.message && (
                            <FormMessage className="form-message" message={errors.root.general.message} danger />
                        )}

                        <div className={styles.submitOptions}>
                            <div className={styles.submitButtons}>
                                <Button primary type="submit">Login</Button>
                                <Link to="/signUp">
                                    <Button>Sign Up</Button>
                                </Link>
                            </div>

                            <Link className={styles.forgotPasswordLink} to='/forgotPassword'>
                                Forgot your password?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LogInPage;