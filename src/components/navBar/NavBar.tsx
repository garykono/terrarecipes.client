import styles from './NavBar.module.css';
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLoaderData, useRevalidator } from 'react-router-dom';
import logo from '../../assets/logo.png'
import { IoClose, IoMenu } from "react-icons/io5";
import { logOut } from '../../api/queries/usersApi';

interface NavBarProps {
    className?: string;
}

export default function NavBar({ className }: NavBarProps) {
    const { user } = useLoaderData();
    const revalidator = useRevalidator();
    const navigate = useNavigate();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogOut = () => {
        logOut()
            .then(() => {
                revalidator.revalidate();
                navigate('/logIn')
            })
            .catch(err => {
                console.log(err);   
            })
    }

   function UserSettings() {
        if (!user) {
            return (
                <div className={`${styles.navBarItem} ${className}`}>
                    <Link to="/logIn" className={`button button--full`}>
                        Log in
                    </Link>
                </div>
            );
        } else {
            return (
                <div className={`dropdown dropdown--arrow dropdown--is-hoverable ${className}`}>
                    <div className={`dropdown-trigger ${styles.accountName}`}>
                        <span>{user.username}</span>
                    </div>
                    <div className="dropdown-menu dropdown-menu--right">
                        <div className="dropdown-content">
                                <Link className="dropdown-item" to={"/account"}>
                                    Account
                                </Link>
                                <Link className="dropdown-item" to="/createRecipe">
                                    Create Recipe
                                </Link>
                                <Link className="dropdown-item" to={"/myRecipes"}>
                                    My Recipes
                                </Link>
                                <Link className="dropdown-item" to={"/myCollections"}>
                                    Collections
                                </Link>
                                <div className="dropdown-item" onClick={handleLogOut}>
                                    Log out
                                </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    return (
        <nav className={`${styles.navBar}`}>
            <div className={styles.navBarContent}>
                <div className={styles.navBarBrand}>
                    <Link to={"/"}>
                        <img className={styles.logo} src={logo} alt='terrarecipes logo' />
                    </Link>
                </div>

                <div className={styles.navBarMenu}>
                    <div className={styles.navBarMobile}>
                        {showMobileMenu ? 
                            <div className={`${styles.navBarItem} ${styles.mobileMenuButton}`} onClick={() => setShowMobileMenu(false)}>
                                <IoClose className={styles.mobileMenuIcon} />
                            </div> :
                            <div className={`${styles.navBarItem} ${styles.mobileMenuButton}`} onClick={() => setShowMobileMenu(true)}>
                                <IoMenu className={styles.mobileMenuIcon} />
                            </div>
                        }
                    </div>

                    <div className={styles.navBarMain}>
                        <div className={styles.navBarStart}>
                            <div className={styles.navBarItem}>
                                <Link className={styles.navBarLink} to={"/browse"}>
                                    📖 Browse
                                </Link>
                            </div>
                            <div className={styles.navBarItem}>
                                <Link className={styles.navBarLink} to={"/recipes"}>
                                    🔍 Search
                                </Link>
                            </div>
                        </div>
                        <div className={styles.navBarEnd}>
                            <UserSettings />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <nav className={`${styles.navMenuMobile} ${showMobileMenu && styles.navOpen}`}>
                <div className={`${styles.basicMenu}`}>
                    <ul className={`${styles.menu}`}>
                        <li onClick={() => setShowMobileMenu(false)}>
                            <Link to='/' className={`${styles.navMenuMobileItem}`}>Home</Link>
                        </li>
                        <li onClick={() => setShowMobileMenu(false)}>
                            <Link to='/browse' className={`${styles.navMenuMobileItem}`}>Browse</Link>
                        </li>
                        <li onClick={() => setShowMobileMenu(false)}>
                            <Link to='/recipes' className={`${styles.navMenuMobileItem}`}>Search</Link>
                        </li>
                        {!user && 
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/login' className={`${styles.navMenuMobileItem} ${styles.logOutItem}`}>Log In</Link>
                            </li>    
                        } 
                    </ul>

                </div>
                {user &&
                    <div className={`${styles.accountMenu}`}>
                        <ul className={`${styles.menu}`}>
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/editRecipe' className={`${styles.navMenuMobileItem}`}>Create a Recipe</Link>
                            </li>
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/account' className={`${styles.navMenuMobileItem}`}>Account</Link>
                            </li>
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/myRecipes' className={`${styles.navMenuMobileItem}`}>My Recipes</Link>
                            </li>
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/myCollections' className={`${styles.navMenuMobileItem}`}>Collections</Link>
                            </li>
                            <li onClick={() => setShowMobileMenu(false)}>
                                <Link to='/login' className={`${styles.navMenuMobileItem} ${styles.logOutItem}`} onClick={handleLogOut}>Log Out</Link>
                            </li>
                        </ul>
                    </div>
                }
            </nav>
        </nav>
    );
}

