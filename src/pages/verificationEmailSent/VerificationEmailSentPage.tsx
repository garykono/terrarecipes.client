import { Link, useLocation } from 'react-router';
import { resendVerificationEmail } from '../../api/queries/usersApi';
import styles from './VerificationEmailSentPage.module.css';
import { useEffect, useState } from 'react';
import { maskEmail } from '../../utils/maskEmail';
import { CooldownButton } from '../../components/buttons/CooldownButton';
import { logAPI } from '../../utils/logger';

export default function VerificationEmailSentPage () {
    const location = useLocation() as { state?: { email?: string } };
    const [email, setEmail] = useState<string | null>(location.state?.email ?? null);

    const [cooldown, setCooldown] = useState<number>(0);
    const [resendButtonDisabled, setResendButtonDisabled] = useState<boolean>(false);

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
                logAPI.info({ err }, "Error sending verification email.")
                if (err.status === 429) {
                    if (err.details?.additionalInfo?.secondsLeft) {
                        setCooldown(err.details?.additionalInfo?.secondsLeft);
                    } else {
                        setResendButtonDisabled(true);
                    }
                }
            });
    }

    return (
        <div className={styles.verificationEmailSentPage}>
            <div className='container'>
                <div className={`page-top box box--message ${styles.contentBlock}`}>
                    <h1 className="page-title">Verify your email address</h1>

                    <div className={styles.explanationBlock}>
                        <p className="text">
                            A verification email is on its way to {" "}
                            {email
                                ? <strong>{maskEmail(email)}</strong>
                                : "your mailbox"
                            }.
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
                        {email && 
                            <CooldownButton
                                cooldownSeconds={cooldown}
                                disabled={resendButtonDisabled}
                                onClick={() => resendVerificationClicked(email)}
                                className={`button ${styles.resendEmailButton}`}
                            >
                                <span className={styles.resendEmailText}>Resend Link</span>
                            </CooldownButton>
                        }
                    </div>

                    <div className={styles.secondaryActions}>
                        <Link to={"/logIn"} className={`link text-meta`}>Back to Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

    