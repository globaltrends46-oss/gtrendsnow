import React, { createContext, useContext, useState, useEffect } from 'react';

const VipAuthContext = createContext();

export const VipAuthProvider = ({ children }) => {
  const [isVipUser, setIsVipUser] = useState(false);
  const [vipEmail, setVipEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[VipAuthContext] App mounted. Checking localStorage for VIP state...');
    const storedIsVip = localStorage.getItem('is_vip');
    const storedEmail = localStorage.getItem('vip_email');
    
    console.log(`[VipAuthContext] localStorage state -> is_vip: ${storedIsVip}, vip_email: ${storedEmail}`);
    
    if (storedIsVip === 'true') {
      console.log('[VipAuthContext] Restoring VIP session from localStorage.');
      setIsVipUser(true);
      setVipEmail(storedEmail || 'VIP Member');
    } else {
      console.log('[VipAuthContext] No active VIP session found.');
    }
    setLoading(false);
  }, []);

  const loginVip = (email) => {
    console.log(`[VipAuthContext] loginVip called for email: ${email}`);
    localStorage.setItem('is_vip', 'true');
    if (email) {
      localStorage.setItem('vip_email', email);
    }
    setIsVipUser(true);
    setVipEmail(email);
    console.log('[VipAuthContext] VIP state saved to localStorage successfully.');
  };

  const logoutVip = () => {
    console.log('[VipAuthContext] logoutVip called. Clearing localStorage...');
    localStorage.removeItem('is_vip');
    localStorage.removeItem('vip_email');
    setIsVipUser(false);
    setVipEmail(null);
    console.log('[VipAuthContext] VIP state removed from localStorage.');
  };

  return (
    <VipAuthContext.Provider value={{ isVipUser, vipEmail, loginVip, logoutVip, loading }}>
      {children}
    </VipAuthContext.Provider>
  );
};

export const useVipAuth = () => useContext(VipAuthContext);