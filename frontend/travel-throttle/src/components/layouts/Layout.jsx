/**
 * LAYOUT COMPONENT
 * Main application layout wrapper
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout Component
 * Wraps protected pages with navbar and sidebar
 */
export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navbar */}
      <Navbar 
        sidebarOpen={sidebarOpen}
        onMenuClick={toggleSidebar}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggle={toggleCollapse}
      />
      
      {/* Main Content */}
      <main className={cn(
        'pt-16 transition-all duration-300',
        'lg:pl-64',
        sidebarCollapsed && 'lg:pl-20'
      )}>
        <div className="container-custom py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/**
 * Auth Layout - For login/signup pages (no sidebar)
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Simple Navbar for Auth Pages */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-transparent">
        <div className="container-custom">
          <div className="flex items-center justify-center h-16">
            <span className="text-2xl font-bold text-white">
              Travel Throttle
            </span>
          </div>
        </div>
      </nav>
      
      {/* Auth Content */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;