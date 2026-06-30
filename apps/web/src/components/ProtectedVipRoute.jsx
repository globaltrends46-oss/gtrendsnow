import React from 'react';
import { Navigate } from 'react-router-dom';
import { useVipAuth } from '@/contexts/VipAuthContext.jsx';
import { Loader2 } from 'lucide-react';

const ProtectedVipRoute = ({ children }) => {
  const { isVipUser, loading } = useVipAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isVipUser) {
    return <Navigate to="/vip-login" replace />;
  }

  return children;
};

export default ProtectedVipRoute;