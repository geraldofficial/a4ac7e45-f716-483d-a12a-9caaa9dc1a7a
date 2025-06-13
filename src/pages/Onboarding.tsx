import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AvatarSelector } from '@/components/AvatarSelector';
import { GenrePreferenceSurvey } from '@/components/GenrePreferenceSurvey';
import { useAuth } from '@/contexts/AuthContext';
import { FlickPickLogo } from '@/components/FlickPickLogo';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, completeOnboarding, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.onboarding_completed) {
      navigate('/');
      return;
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (selectedGenres.length < 3) {
      return;
    }

    setIsLoading(true);
    try {
      await completeOnboarding(selectedAvatar, selectedGenres);
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 w-full max-w-2xl p-8">
        <div className="flex items-center justify-center mb-8">
          <FlickPickLogo />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white text-2xl font-bold">
              Welcome to FlickPick!
            </div>
            <div className="text-white/60 text-sm">
              Step {currentStep} of 2
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2 mb-6">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Choose Your Avatar</h2>
              <p className="text-white/70">Pick an avatar that represents you</p>
            </div>
            
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarSelect={setSelectedAvatar}
              className="text-center"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">What do you like to watch?</h2>
              <p className="text-white/70">Help us personalize your experience</p>
            </div>
            
            <GenrePreferenceSurvey
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
            />

            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button
                onClick={handleComplete}
                disabled={selectedGenres.length < 3 || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
