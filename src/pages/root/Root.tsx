import styles from './Root.module.css';
import { Outlet } from 'react-router-dom';
import useScrollToTop from '../../hooks/use-scroll-to-top';
import NavBar from '../../components/navBar/NavBar';
import Footer from '../../components/footer/Footer';

export default function Root() {
    useScrollToTop();   

    return (
        <div className={styles.rootLayout}>
            <div className={styles.header}>
                <NavBar />
            </div>
            <div className={styles.outlet}>
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}