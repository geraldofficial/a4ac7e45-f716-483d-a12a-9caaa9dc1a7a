
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlickPickLogo } from '../FlickPickLogo';

export const NavbarLogo: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center">
      <div onClick={handleLogoClick} className="cursor-pointer" style={{ touchAction: 'manipulation' }}>
        <FlickPickLogo />
      </div>
    </div>
  );
};
