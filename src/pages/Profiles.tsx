
import React, { useEffect } from 'react';
import { ProfileSelector } from '@/components/ProfileSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profiles = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProfileSelect = (profile: any) => {
    try {
      // Store selected profile in localStorage and navigate to home
      localStorage.setItem('selectedProfile', JSON.stringify(profile));
      
      toast({
        title: "Profile selected",
        description: `Welcome back, ${profile.name}!`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error selecting profile:', error);
      toast({
        title: "Error",
        description: "Failed to select profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    // Auto-redirect if not authenticated after loading completes
    if (!loading && !user && !error) {
      navigate('/auth');
    }
  }, [loading, user, error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white/60 mt-4">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-white/70 mb-6">
            {error || 'Failed to load user profiles. Please try signing in again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/auth')} variant="default">
              Sign In Again
            </Button>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-white text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">
            Please sign in to access your profiles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/auth')} variant="default">
              Sign In
            </Button>
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ProfileSelector 
        onProfileSelect={handleProfileSelect}
        currentProfileId={(() => {
          try {
            const savedProfile = localStorage.getItem('selectedProfile');
            return savedProfile ? JSON.parse(savedProfile).id : undefined;
          } catch {
            return undefined;
          }
        })()}
      />
    </div>
  );
};

export default Profiles;
