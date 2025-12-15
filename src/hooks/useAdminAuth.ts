import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('admin_authenticated');
      setIsAuthenticated(auth === 'true');
      setLoading(false);
      
      if (!auth && window.location.pathname !== '/admin/login') {
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  return { isAuthenticated, loading, logout };
};