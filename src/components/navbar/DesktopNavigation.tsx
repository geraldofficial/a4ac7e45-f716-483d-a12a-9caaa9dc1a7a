
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const DesktopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-8">
      <button 
        onClick={() => navigate('/')}
        className="text-foreground hover:text-primary transition-colors font-medium"
        style={{ touchAction: 'manipulation' }}
      >
        Home
      </button>
      <button 
        onClick={() => navigate('/browse')}
        className="text-foreground hover:text-primary transition-colors font-medium"
        style={{ touchAction: 'manipulation' }}
      >
        Browse
      </button>
      <button 
        onClick={() => navigate('/trending')}
        className="text-foreground hover:text-primary transition-colors font-medium"
        style={{ touchAction: 'manipulation' }}
      >
        Trending
      </button>
      <button 
        onClick={() => navigate('/top-rated')}
        className="text-foreground hover:text-primary transition-colors font-medium"
        style={{ touchAction: 'manipulation' }}
      >
        Top Rated
      </button>
      <button 
        onClick={() => navigate('/support')}
        className="text-foreground hover:text-primary transition-colors font-medium"
        style={{ touchAction: 'manipulation' }}
      >
        Donate
      </button>
      {user && (
        <button 
          onClick={() => navigate('/history')}
          className="text-foreground hover:text-primary transition-colors font-medium"
          style={{ touchAction: 'manipulation' }}
        >
          History
        </button>
      )}
    </div>
  );
};
