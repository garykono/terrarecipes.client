import styles from './AccountEditPage.module.css';
import { useState, useEffect } from 'react'
import { Link, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateUserInfo, deleteUser, updateUserPassword } from '../../api/queries/usersApi';
import Modal from '../../components/modal/Modal'
import FormMessage from '../../components/formMessage/FormMessage';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import Button from '../../components/buttons/Button';
import { log } from '../../utils/logger';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { AppError } from '../../utils/errors/types';

export default function AccountEditPage () {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { user } = useRouteLoaderData('root');
    const [ pageError, setPageError ] = useState<AppError | null>(null);
    const [ showModal, setShowModal ] = useState(false);

    function AccountManagementForm() {
        const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
            defaultValues: {
                username: user? user.username : ''
            }
        });

        const [ successMessage, setSuccessMessage ] = useState("");
        const usernameValue = watch('username');

        useEffect(() => {
            clearErrors('root.general');
        }, [usernameValue]);


        interface FormData {
            username: string;
        }

        const onSubmit = async ({ username }: FormData) => {
            await updateUserInfo({
                    username
                })
                .then((updatedUser) => {
                    setSuccessMessage("Account has been updated!");
                    // In the future, probably reset the page or navigate somewhere on form submits, and use an alert to inform user
                    //revalidator.revalidate();
                })
                .catch(err => {
                    setSuccessMessage("");
                    useSetError(err, setError as ErrorMessageSetter);
                });
        }

        if (errors.root?.other) {
            setPageError(errors.root.other as AppError);
        }

        return (
            <form 
                className={`form card card--form ${styles.form} form-login`}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="form-heading">
                    <h2 className="form-title">Account Info</h2>
                </div>
                <div className="field">
                    <label className="label">Username</label>
                    <div className="control">
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
                            <FormMessage className='form-message' message={errors.username.message as string} danger />
                        )}
                    </div>
                </div>

                <div className="field">
                    <label className="label">Email</label>
                    <div className="control">
                        <div className={styles.changeEmailField}>
                            <p>{user.email}</p>
                            <Link to={`/changeEmail`} className={styles.changeEmailLink}>
                                <p className="text-small">
                                    Change
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={styles.buttons}>
                    <Button primary type="submit">Save</Button>
                </div>

                
                {successMessage !== '' &&
                    <FormMessage className='form-message' message={successMessage} success />
                }
                {errors.root?.general?.message &&
                    <FormMessage className='form-message' message={errors.root.general.message} danger />
                }
            </form>
        )
    }

    function ChangePasswordForm() {
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

            if (errors.root?.other) {
                setPageError(errors.root.other as AppError);
            }

            return (
                <form className={`form card card--form ${styles.form}`} onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-heading">
                        <h1 className='form-title'>Change My Password</h1>
                    </div>

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
                    
                    <div className={styles.buttons}>
                        <Button primary type="submit">Submit</Button>
                    </div>
                    {successMessage !== '' &&
                        <FormMessage className='form-message' message={successMessage} success />
                    }
                    {errors.root?.general?.message &&
                        <FormMessage className='form-message' message={errors.root.general.message} danger />
                    }
                </form>
            )
    }

    const handleDeleteButton = async () => {
        deleteUser()
            .then(() => {
                revalidator.revalidate();
                navigate('/')
            })
            .catch(error => {
                log.warn({ error }, "failed to delete account")
            })
    }

    const modal = (
        <Modal 
            onClose={() => setShowModal(false)} 
            windowTitle='Delete account?'
            danger
        >
            Are you sure you want to delete your account?
            <div className="buttons">
                <Button
                    onClick={() => setShowModal(false)}
                    type="button"
                >
                    Cancel
                </Button>
                <Button type="button" 
                    className={`${styles.deleteCollectionModalButton}`}
                    danger 
                    onClick={handleDeleteButton}
                >
                    Delete
                </Button>
            </div>
        </Modal>
    );

    if (!user) { 
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.NOT_LOGGED_IN })} /> 
    }

    if (pageError) {
        return <GlobalErrorDisplay error={createAppError(pageError)} />;
    }

    return (
        <div className="page-account-edit">
            <BasicHero title="Account Edit Page" />

            <section className="page-top section">
                <div className="container">
                    <AccountManagementForm />
                </div>
            </section>

            <section className="section section-change-password">
                <div className="container">
                    <ChangePasswordForm />
                </div>
            </section>

            <section className="section section-account-delete"> 
                <div className="container">
                    <form className="form card card--form">
                        <div className="account-delete">
                            <div className="form-heading">
                                <h2 className="form-title">Account Management</h2>
                            </div>
                            <Button
                                className={`button button--danger ${styles.deleteButton}`}
                                data-target="modal-js-example" 
                                onClick={() => setShowModal(true)}
                                type="button"
                            >
                                Delete Account
                            </Button>   
                        </div> 
                    </form>
                </div>                            
            </section>
            {showModal && modal}
        </div>
    )
}