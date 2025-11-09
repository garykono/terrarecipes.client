import { useLoaderData, useNavigate } from 'react-router';
import styles from './VerifyEmailPage.module.css';
import { VerifyEmailLoaderResult } from './verifyEmailLoader';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const { emailVerified, reason } = useLoaderData() as VerifyEmailLoaderResult;

    useEffect(() => {
        if (emailVerified) {
            navigate('/verifyEmail/success')
        }
    }, [emailVerified]);

    const failureContent = (
        <div className={styles.successContent}>
            <p>{reason} </p>
        </div>
    )

    return (
        <div className={styles.verifyEmailPage}>
            <div className={"container"}>
                <div className={`page-top ${styles.pageContent}`}>
                    {!emailVerified &&
                        failureContent
                    }    
                </div>
            </div>
        </div>
    );
}