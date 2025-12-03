import React, { useEffect, useState } from "react";
import { EnhancedHeroCarousel } from "@/components/hero/EnhancedHeroCarousel";
import { EnhancedMovieSection } from "@/components/EnhancedMovieSection";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Star, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

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

  const featuredCategories = [
    { title: "Trending", icon: TrendingUp, link: "/trending" },
    { title: "Top Rated", icon: Star, link: "/browse" },
    { title: "Browse", icon: Film, link: "/browse" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <EnhancedHeroCarousel profile={currentProfile} />

      {/* Quick Categories */}
      <section className="relative z-10 -mt-12 md:-mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} to={category.link}>
                  <Card className="group border-border bg-card/90 hover:bg-card transition-colors">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                        </div>
                        <h3 className="text-[11px] md:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-10">
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
