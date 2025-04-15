import { useState, useContext, useEffect } from 'react'
import { Form, Link, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateUserInfo, deleteUser } from '../api/queries/usersApi';
import Modal from '../components/Modal'
import { isEmail } from '../utils/validation';
import FormMessage from '../components/FormMessage';
import { ErrorMessageSetter, useSetError } from '../hooks/form-submit-error-handling';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';

export default function AccountEditPage () {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { user } = useRouteLoaderData('root');
    const [ showModal, setShowModal ] = useState(false);

    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            username: user? user.username : '',
            email: user? user.email : ''
        }
    });

    const [ isSuccess, setIsSuccess ] = useState(false);
    const usernameValue = watch('username');
    const emailValue = watch('email');

    useEffect(() => {
        clearErrors('root.general');
    }, [usernameValue, emailValue]);

    interface FormData {
        username: string;
        email: string;
    }

    const onSubmit = async ({ username, email }: FormData) => {
        await updateUserInfo({
                username,
                email
            })
            .then(() => {
                revalidator.revalidate();
                setIsSuccess(true);
            })
            .catch(err => {
                setIsSuccess(false);
                useSetError(err, setError as ErrorMessageSetter);
            });
    }

    const handleDeleteButton = async () => {
        deleteUser()
            .then(() => {
                revalidator.revalidate();
                navigate('/')
            })
            .catch(error => {
                console.log(error)
            })
    }

    const modal = (
        <Modal 
            onClose={() => setShowModal(false)} 
            onConfirm={handleDeleteButton} 
            title='Delete account?'
            submitButtonText='Delete'
            danger>
            Are you sure you want to delete your account?
        </Modal>
    );

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <>
            <section className="hero is-small my-color-bg">
                <div className="hero-body">
                    <p className="title my-color-bg">Account Edit Page</p>
                </div>
            </section>

            <section className="section column is-4">
                <form 
                    className="is-flex is-flex-direction-column"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="field">
                        <label className="label">Username</label>
                            <input 
                                className="input" 
                                type="username" 
                                {...register("username", {
                                    required: "Username cannot be blank.",
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
                                <FormMessage message={errors.username.message as string} danger />
                            )}
                    </div>

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
                                <FormMessage message={errors.email.message as string} danger />
                            )}
                        </div>
                    </div>

                    {errors.root?.general?.message && 
                        <FormMessage message={errors.root.general.message} danger />
                    }
                    {isSuccess &&
                        <FormMessage message={'Account updated!'} success />
                    }

                    <div className="field">
                        <div className="control">
                            <div className="buttons mt-4">
                                <button className="button" type="button" onClick={() => navigate('/account')}>
                                    Cancel
                                </button>
                                <button className="button my-color-bg" type='submit'>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            <section className="section"> 
                <button
                    className="button is-danger js-modal-trigger" 
                    data-target="modal-js-example" 
                    onClick={() => setShowModal(true)}
                    type="button"
                >
                    Delete Account
                </button>                                
            </section>
            {showModal && modal}
        </>
    )
}