import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't auto-scroll on the Team page
    if (pathname === '/team') {
      return;
    }

    // Check if browser supports smooth scrolling
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback for browsers that don't support smooth scrolling
      window.scrollTo(0, 0);
    }
  }, [pathname]);
}