import { useState, useContext, useEffect } from 'react'
import { Link, useRouteLoaderData } from 'react-router-dom';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';
import { RootLoaderResult } from './root/rootLoader';

function AccountPage () {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <>
            <section className="hero is-small my-color-bg">
                <div className="hero-body">
                    <p className="title my-color-bg">Account Page</p>
                </div>
            </section>

            <section className='section'>
                <div className="is-flex is-justify-content-end">
                    <Link to='/accountEdit' className="button">
                        Edit Account
                    </Link>
                </div>

                <div className="is-flex is-flex-direction-column">
                    <div className="column is-8">
                        <div className="has-text-black">
                            <div className="columns">
                                <p className="column is-6">Username: </p>
                                <p className="column is-6">{user && user.username}</p>
                            </div>

                            <div className="columns">
                                <p className="column is-6">Email: </p>
                                <p className="column is-6">{user && user.email}</p>
                            </div>
                        </div>
                    </div>  
                    <section className="section">   
                        <Link to="/changePassword">Change my password</Link>  
                    </section>
                </div>
            </section>
        </>
    )
}

export default AccountPage;