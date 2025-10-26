import styles from './ForgotPassword.module.css';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../api/queries/usersApi';
import { isEmail } from '../../utils/validation';
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import Button from '../../components/buttons/Button';

function ForgotPasswordPage() {
    const [ emailSent, setEmailSent ] = useState(false);

    const { register, handleSubmit, watch, setError, clearErrors, reset, formState: { errors } } = useForm({
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: ''
        }
    });

    const emailValue = watch('email');

    useEffect(() => {
        clearErrors('root.general');
    }, [emailValue])

    interface FormData {
        email: string;
    }

    const onSubmit = ({ email }: FormData) => {
        forgotPassword(email)
        .then(response => {
            reset();
            setEmailSent(true);
        })
        .catch(err => {
            // No validation check for email on backend
            if (err.status === 404) {
                setError('root.general', { message: 'There is no account associated with that email address.' });
            } else {
                console.log(err);
                setError('root.other', err);
                // setError('general', { message: 'There was an error with sending the email.' });
            }
        })
    }

    let formContent = (
        <div className="container">
            <div className={styles.formContainer}>
                <form 
                    className={`form card card--form ${styles.formForgotPassword}`}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="form-heading">
                        <h1 className="form-title">Forgot Password</h1>
                        <h2 className="form-description">Enter your email and we'll send you a link to reset your password.</h2>
                    </div>
                    <div className="field">
                    <label className="label mt-4">Email</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="text"
                                {...register("email", {
                                    required: "Please enter an email address.",
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
                    <div className={`${styles.submitButtons}`}>
                            <Button primary type="submit">Send Reset Link</Button>
                    </div>
                    {errors.root?.general?.message && (
                        <FormMessage message={errors.root.general.message} danger />
                    )}
                </form>
            </div>
        </div>
    );
    
    let afterSubmitContent = (
        <p className={`page-top subsection-title ${styles.emailSentMessage}`}>
            A password reset link has been sent to your email.
        </p>
    );

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className={styles.pageForgotPassword}>
            {emailSent? afterSubmitContent : formContent}
        </div>
    );
}

export default ForgotPasswordPage;