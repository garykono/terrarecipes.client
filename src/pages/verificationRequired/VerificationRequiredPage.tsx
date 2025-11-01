import { useLocation } from 'react-router';
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
                <div className={`page-top ${styles.messages}`}>
                    <p className={`section-title ${styles.postSignUpMessage}`}>
                        { fromLogin
                            ? "You're almost there — check your email to verify your account and unlock more features."
                            : "Please check your email to verify your account and unlock more features."
                        }
                    </p>
                    {email && 
                        <div className={styles.resendLine}>
                            <p>{`Didn't get it? `}</p>
                            <CooldownButton
                                cooldownSeconds={60}
                                as={"link"}
                                onClick={() => resendVerificationClicked(email)}
                            >
                                Resend Link
                            </CooldownButton>
                            
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}