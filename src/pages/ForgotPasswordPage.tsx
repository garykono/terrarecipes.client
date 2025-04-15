import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../api/queries/usersApi';
import { isEmail } from '../utils/validation';
import FormMessage from '../components/FormMessage';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';

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
        <form 
            className="is-flex is-flex-direction-column is-align-items-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2 className="title is-2 is-spaced">Forgot My Password</h2>
            <div className="field">
                <div className="control">
                    <label className="label mt-4">Email</label>
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
            <div className="field">
                <div className="control">
                    <button type="submit" className="button my-color-bg mt-2">
                        Submit
                    </button>
                </div>
            </div>
            {errors.root?.general?.message && (
                <FormMessage message={errors.root.general.message} danger />
            )}
        </form>
    );
    
    let afterSubmitContent = (
        <p className="has-text-centered has-text-weight-medium">
            Send email has not been implemented yet. For now, there is not a way to change passwords.
        </p>
    );

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        emailSent? afterSubmitContent : formContent
    );
}

export default ForgotPasswordPage;