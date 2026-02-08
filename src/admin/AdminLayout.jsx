import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate admin access
    const authUser = JSON.parse(localStorage.getItem('authUser'));
    
    if (!authUser || authUser.role !== 'admin') {
      console.log('Not admin, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [navigate, user, role, isAuthenticated]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;