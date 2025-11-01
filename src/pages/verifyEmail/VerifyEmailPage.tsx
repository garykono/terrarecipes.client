import { useLoaderData } from 'react-router';
import styles from './VerifyEmailPage.module.css';
import { VerifyEmailLoaderResult } from './verifyEmailLoader';

export default function VerifyEmailPage() {
    const { emailVerified, reason } = useLoaderData() as VerifyEmailLoaderResult;

    const successContent = (
        <div className={styles.successContent}>
            <p>Congratulations 🎉! Your account has been successfully verified.</p>
        </div>
    )

    const failureContent = (
        <div className={styles.successContent}>
            <p>{reason} </p>
        </div>
    )

    return (
        <div className={styles.verifyEmailPage}>
            <div className={"container"}>
                <div className={`page-top ${styles.pageContent}`}>
                    {emailVerified ? successContent : failureContent}
                </div>
            </div>
        </div>
    );
}