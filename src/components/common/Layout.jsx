import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineBanner from './OfflineBanner';
import ServerWakeNotice from './ServerWakeNotice';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // On client-side navigation, move focus to the new page's content so keyboard
  // and screen-reader users start at the top of the page that just loaded,
  // instead of wherever the element they activated used to be.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-red-700 focus:font-semibold focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <OfflineBanner />
      <ServerWakeNotice />
      <Navbar />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-grow focus:outline-none">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
