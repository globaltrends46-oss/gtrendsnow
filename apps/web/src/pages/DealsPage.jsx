import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DealsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect all users to VIP Landing page as per freemium logic
    navigate('/vip-landing', { replace: true });
  }, [navigate]);

  return null;
};

export default DealsPage;