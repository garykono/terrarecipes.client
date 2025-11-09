import styles from "./ChangeEmailPage.module.css";
import { RootLoaderResult } from "../root/rootLoader";
import { useEffect, useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import { useForm } from "react-hook-form";
import GlobalErrorDisplay from "../../components/globalErrorDisplay/GlobalErrorDisplay";
import { ErrorMessageSetter, useSetError } from "../../hooks/form-submit-error-handling";
import FormMessage from "../../components/formMessage/FormMessage";
import { isEmail } from "../../utils/validation";
import Button from "../../components/buttons/Button";
import BasicHero from "../../components/basicHero/BasicHero";
import { User } from "../../api/types/user";
import { CooldownButton } from "../../components/buttons/CooldownButton";
import { resendVerificationEmail, updateUserEmail } from "../../api/queries/usersApi";
import { maskEmail } from "../../utils/maskEmail";

export default function ChangeEmailPage() {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;

    const [ emailChangeIsInitiated, setEmailChangeIsInitiated ] = useState(false);

    function ChangeEmailForm({ user }: { user: User }) {
        const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
            defaultValues: {
                newEmail: '',
                password: ''
            }
        });
        
        const newEmailValue = watch('newEmail');
        const passwordValue = watch('password');

        useEffect(() => {
            clearErrors('root.general');
        }, [newEmailValue, passwordValue]);

        interface FormData {
            newEmail: string;
            password: string;
        }

        const onSubmit = async ({ newEmail, password }: FormData) => {
            await updateUserEmail(
                newEmail,
                password
            )
            .then((response) => {
                setEmailChangeIsInitiated(true);
            })
            .catch(err => {
                if (err.status && err.status === 401) {
                    setError('root.general', { message: "Email address or password is incorrect." });
                } else if(err.name && err.name === "SAME_EMAIL") {
                    setError('newEmail', { message: "This is already your email address." });
                } else if(err.name && err.name === "ALREADY_TAKEN") {
                    setError('newEmail', { message: "This email address is already in use." });
                } else {
                    useSetError(err, setError as ErrorMessageSetter);
                }
            });
        }        

        return (
            <div className={styles.formContainer}>
                <form 
                    className={`form card card--form ${styles.form}`}
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <div className="field">
                        <label className="label">Current Email</label>
                        <div className="control">
                            <p>{user.email}</p>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">New Email</label>
                        <input 
                            className="input" 
                            type="text" 
                            {...register("newEmail", {
                                required: "Email is required.",
                                validate: {
                                    isEmail: (value) => {
                                        if (!isEmail(value)) return 'Must provide a valid email address.';
                                    }
                                }
                            })}
                        />
                        {errors.newEmail?.message && (
                            <FormMessage className='form-message' message={errors.newEmail.message as string} danger />
                        )}
                    </div>

                    <div className="field">
                        <label className="label">Password</label>
                        <input 
                            className="input" 
                            type="password" 
                            {...register("password", {
                                required: "Please enter your password."
                            })}
                        />
                        {errors.password?.message && (
                            <FormMessage className='form-message' message={errors.password.message} danger />
                        )}
                        </div>

                    <div className={styles.buttons}>
                        <Button primary type="submit">Submit</Button>
                    </div>

                    {errors.root?.general?.message &&
                        <FormMessage className='form-message' message={errors.root.general.message} danger />
                    }
                </form>
            </div>
        )
    }

    function SentValidationPanel({ user }: { user: User }) {
        const resendVerificationClicked = (email: string) => {
            resendVerificationEmail(email)
                .then((response) => {
                })
                .catch(err => {
                });
        }

        return (
            <div className={`page-top box box--message ${styles.contentBlock}`}>
                <div className={styles.explanationBlock}>
                    <p className="text">
                        A verification email was sent to the new email address{user.email && ` ${maskEmail(user.email)}`}.
                    </p>
                    <p className="text">Open the message and click the link to finish verifying your email address.</p>
                </div>
                
                <div className={styles.troubleshootingBlock}>
                    <p className="subsection-title">Didn't get it?</p>
                    <ul className={styles.troubleshootingList}>
                        <li>It may take up to a minute</li>
                        <li>Check your spam/junk folder</li>
                        <li>Make sure terrarecipes.xyz isn't blocked</li>
                    </ul>
                </div>
                    
                <div className={styles.primaryAction}>
                    {user.email && 
                        <CooldownButton
                            cooldownSeconds={60}
                            onClick={() => resendVerificationClicked(user.email)}
                            className={`button ${styles.resendEmailButton}`}
                        >
                            <span className={styles.resendEmailText}>Resend Link</span>
                        </CooldownButton>
                    }
                </div>

                <div className={styles.secondaryActions}>
                    <Link to={"/account"} className={`link text-meta`}>Back to Account Settings</Link>
                </div>
            </div>
        )
    }

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <div className="page-account-edit">
            <BasicHero title="Change Email Address" />

            <section className="page-top section">
                <div className="container">
                    {!emailChangeIsInitiated
                        ? <ChangeEmailForm user={user} />
                        : <SentValidationPanel user={user} />
                    }
                </div>
            </section>
        </div>
    )
}