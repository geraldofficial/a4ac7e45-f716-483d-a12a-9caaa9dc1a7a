
import React from 'react';
import { ProfileSelector } from '@/components/ProfileSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Profiles = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleProfileSelect = (profile: any) => {
    // Store selected profile in localStorage and navigate to home
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profiles..." />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <ProfileSelector 
      onProfileSelect={handleProfileSelect}
      currentProfileId={localStorage.getItem('selectedProfile') ? JSON.parse(localStorage.getItem('selectedProfile') || '{}').id : undefined}
    />
  );
};

export default Profiles;
