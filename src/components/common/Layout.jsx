import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-red-700 focus:font-semibold focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
