import { Outlet } from 'react-router-dom';
import useScrollToTop from '../../hooks/use-scroll-to-top';
import NavBar from '../../components/NavBar';

export default function Root() {
    useScrollToTop();   

    return (
        <>
            <div className="px-1 py-3">
                <NavBar />
            </div>
            <Outlet />
        </>
    )
}