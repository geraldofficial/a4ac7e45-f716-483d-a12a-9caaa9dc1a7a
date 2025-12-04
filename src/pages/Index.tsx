import React, { useEffect, useState } from "react";
import { EnhancedHeroCarousel } from "@/components/hero/EnhancedHeroCarousel";
import { EnhancedMovieSection } from "@/components/EnhancedMovieSection";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("selectedProfile");
    if (savedProfile) {
      try {
        setCurrentProfile(JSON.parse(savedProfile));
      } catch (error) {
        localStorage.removeItem("selectedProfile");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <EnhancedHeroCarousel profile={currentProfile} />

      {/* Main Content */}
      <main className="relative z-10 pt-4 md:pt-8">
        <div className="container mx-auto px-4 space-y-6 md:space-y-10">
          {user && (
            <>
              <ContinueWatching profile={currentProfile} />
              <RecentlyWatched profile={currentProfile} />
            </>
          )}
          <EnhancedMovieSection />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
