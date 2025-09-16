import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getActiveMenuItem = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      path: '/dashboard',
      active: getActiveMenuItem('/dashboard')
    },
    {
      label: 'Potrošnja',
      icon: 'pi pi-list',
      path: '/consumption',
      active: getActiveMenuItem('/consumption')
    },
    {
      label: 'Materijali',
      icon: 'pi pi-box',
      path: '/materials',
      active: getActiveMenuItem('/materials')
    },
    {
      label: 'Prijemnice',
      icon: 'pi pi-truck',
      path: '/receipts',
      active: getActiveMenuItem('/receipts')
    },
    {
      label: 'Rashodovanje',
      icon: 'pi pi-exclamation-triangle',
      path: '/disposals',
      active: getActiveMenuItem('/disposals')
    },
    {
      label: 'Sarze',
      icon: 'pi pi-cog',
      path: '/resins',
      active: getActiveMenuItem('/resins')
    },
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Korisnici',
            icon: 'pi pi-users',
            path: '/users',
            active: getActiveMenuItem('/users')
          }
        ]
      : [])
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setSidebarVisible(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/consumption': return 'Potrošnja';
      case '/materials': return 'Materijali';
      case '/receipts': return 'Prijemnice';
      case '/disposals': return 'Rashodovanje';
      case '/resins': return 'Sarze';
      case '/users': return 'Korisnici';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="layout-wrapper">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <div className="sidebar-header">
          <h2 className="text-xl font-bold text-gray-800">Potrošnja Smole</h2>
          <p className="text-sm text-gray-600 mt-1">Sistem upravljanja</p>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-items-container">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`menu-item ${item.active ? 'menu-item-active' : ''}`}
                onClick={() => handleMenuItemClick(item.path)}
              >
                <i className={`menu-item-icon ${item.icon}`}></i>
                <span className="menu-item-label">{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="menu-logout-container">
            <div className="menu-item menu-item-logout" onClick={handleLogout}>
              <i className="menu-item-icon pi pi-sign-out"></i>
              <span className="menu-item-label">Odjavi se</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="layout-main">
        {/* Top Toolbar */}
        <div className="p-toolbar">
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center">
              <Button
                icon="pi pi-bars"
                className="mobile-menu-btn p-button-text p-button-sm mr-3"
                onClick={toggleSidebar}
                aria-label="Toggle Menu"
              />
              <h1 className="text-xl font-bold text-gray-800 m-0">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex align-items-center">
              <span className="user-welcome text-gray-700 mr-3">
                Dobrodošli, <strong>{user?.firstName} {user?.lastName}</strong>
              </span>
              <span className="text-sm text-gray-500">
                ({user?.role === 'admin' ? 'Administrator' : 'Korisnik'})
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="layout-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarVisible && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${sidebarVisible ? 'mobile-sidebar-visible' : ''}`}>
        <div className="mobile-sidebar-header">
          <h2 className="text-lg font-bold text-gray-800">Meni</h2>
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-sm"
            onClick={() => setSidebarVisible(false)}
            aria-label="Close Menu"
          />
        </div>
        
        <div className="mobile-sidebar-menu">
          <div className="menu-items-container">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`menu-item ${item.active ? 'menu-item-active' : ''}`}
                onClick={() => handleMenuItemClick(item.path)}
              >
                <i className={`menu-item-icon ${item.icon}`}></i>
                <span className="menu-item-label">{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="menu-logout-container">
            <div className="menu-item menu-item-logout" onClick={handleLogout}>
              <i className="menu-item-icon pi pi-sign-out"></i>
              <span className="menu-item-label">Odjavi se</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
