import { Link, useLocation } from 'react-router';
import { resendVerificationEmail } from '../../api/queries/usersApi';
import styles from './VerificationRequiredPage.module.css';
import { useEffect, useState } from 'react';
import { CooldownButton } from '../../components/buttons/CooldownButton';

export default function VerificationRequiredPage () {
    const location = useLocation() as { state?: { email?: string; fromLogin?: boolean } };
    const [email, setEmail] = useState<string | null>(location.state?.email ?? null);
    const [fromLogin, setFromLogin] = useState<boolean | null>(location.state?.fromLogin ?? false);

    useEffect(() => {
        if (location.state?.email) {
            sessionStorage.setItem("signup_email", location.state.email);
        } else {
            const saved = sessionStorage.getItem("signup_email");
            if (saved) setEmail(saved);
        }
    }, []);

    const resendVerificationClicked = (email: string) => {
        resendVerificationEmail(email)
            .then(() => {
            })
            .catch(err => {
            });
    }

    return (
        <div className={styles.verificationRequiredPage}>
            <div className='container'>
                <div className={`page-top box box--message ${styles.contentBlock}`}>
                    <h1 className="page-title">Verify your email address</h1>

                    <div className={styles.explanationBlock}>
                        <p className="text">
                            { fromLogin
                                ? "You're almost there — check your email to verify your account and unlock more features."
                                : "Please check your email to verify your account and unlock more features."
                            }
                        </p>
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
                        {email && 
                            <CooldownButton
                                cooldownSeconds={60}
                                onClick={() => resendVerificationClicked(email)}
                                className={`button ${styles.resendEmailButton}`}
                            >
                                <span className={styles.resendEmailText}>Resend Link</span>
                            </CooldownButton>
                        }
                    </div>

                    <div className={styles.secondaryActions}>
                        <Link to={"/"} className={`link text-meta`}>Continue to Home Page</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}