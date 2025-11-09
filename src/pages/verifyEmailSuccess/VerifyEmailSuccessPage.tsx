import { Link, useNavigate } from 'react-router';
import styles from './VerifyEmailSuccessPage.module.css';
import Button from '../../components/buttons/Button';

export default function VerifyEmailSuccessPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.verifyEmailSuccessPage}>
            <div className='container'>
                <div className={`page-top box box--message ${styles.contentBlock}`}>
                    <h1 className="page-title">Your email has been verified! 🎉</h1>

                    <div className={styles.explanationBlock}>
                        <p className="text">
                            Your email address is now confirmed and your account is fully active.
                        </p>
                    </div>
                        
                    <div className={styles.primaryAction}>
                        <Button primary onClick={() => navigate('/')}>
                            <span className={styles.primaryButtonText}>
                                Continue to Terrarecipes
                            </span>
                        </Button>
                    </div>

                    <div className={styles.secondaryActions}>
                        <Link to={"/account"} className={`link text-meta`}>Go to Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}