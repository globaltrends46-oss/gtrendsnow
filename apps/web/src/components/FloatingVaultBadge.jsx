import React from 'react';
import { useLocation } from 'react-router-dom';

const FloatingVaultBadge = () => {
  const location = useLocation();

  if (location.pathname === '/vault') {
    return null;
  }

  return (
    <a 
      href="https://gtrendsnow.com/vault" 
      className="floating-vault-badge"
      target="_blank"
      rel="noopener noreferrer"
    >
      📊 Access the Global Vault (7+ Premium Toolkits)
    </a>
  );
};

export default FloatingVaultBadge;