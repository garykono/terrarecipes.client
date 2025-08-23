import styles from './AccountPage.module.css';
import { useState, useContext, useEffect } from 'react'
import { Link, useRouteLoaderData } from 'react-router-dom';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import BasicHero from '../../components/basicHero/BasicHero';

function AccountPage () {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <div className="account-page">
            <BasicHero title="Account Page" />

            <section className={`page-top ${styles.sectionEdit}`}>
                <div className="container">
                    <div className={styles.editAccount}>
                        <Link to="/accountEdit" className="button button--full button--small">
                            Edit Account
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.sectionAccountInfo}>
                <div className="container">
                    <div className={styles.accountInfo}>
                        <div className={styles.accountInfoField}>
                            <p className={styles.accountInfoLabel}>Username: </p>
                            <p className={styles.accountInfoValue}>{user && user.username}</p>
                        </div>

                        <div className={styles.accountInfoField}>
                            <p className={styles.accountInfoLabel}>Email: </p>
                            <p className={styles.accountInfoValue}>{user && user.email}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.sectionChangePassword}>  
                <div className="container"> 
                    <Link className="button button--small button--full" to="/changePassword">Change my password</Link>  
                </div>
            </section>
        </div>
    )
}

export default AccountPage;