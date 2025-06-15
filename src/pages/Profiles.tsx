
import React from 'react';
import { ProfileManager } from '@/components/profiles/ProfileManager';

const Profiles = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ProfileManager />
      </div>
    </div>
  );
};

export default Profiles;
