import { useLocation } from 'react-router';
import { resendVerificationEmail } from '../../api/queries/usersApi';
import styles from './VerificationEmailSentPage.module.css';
import { useEffect, useState } from 'react';
import { maskEmail } from '../../utils/maskEmail';
import { CooldownButton } from '../../components/buttons/CooldownButton';

export default function VerificationEmailSentPage () {
    const location = useLocation() as { state?: { email?: string } };
    const [email, setEmail] = useState<string | null>(location.state?.email ?? null);

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
        <div className={styles.verificationEmailSentPage}>
            <div className='container'>
                <div className={`page-top ${styles.messages}`}>
                    <p className={`section-title ${styles.postSignUpMessage}`}>
                        {email 
                            ? `We sent a verification email to ${maskEmail(email)}.` 
                            : "We sent a verification email. Please check your inbox."
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

    