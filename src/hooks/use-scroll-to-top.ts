import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollToTop() {
    const currentPath = useLocation().pathname;

    useEffect(() => {
        window.scrollTo(0, 0);
      }, [currentPath]);
}