import React, { useEffect, useState } from "react";
import { EnhancedHeroCarousel } from "@/components/hero/EnhancedHeroCarousel";
import { EnhancedMovieSection } from "@/components/EnhancedMovieSection";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentlyWatched } from "@/components/RecentlyWatched";
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
        const parsedProfile = JSON.parse(savedProfile);
        setCurrentProfile(parsedProfile);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
        localStorage.removeItem("selectedProfile");
      }
    }
  }, []);

  const featuredCategories = [
    { title: "Trending", description: "What's hot", icon: TrendingUp, link: "/trending" },
    { title: "Top Rated", description: "Best content", icon: Star, link: "/browse" },
    { title: "Browse", description: "Explore all", icon: Film, link: "/browse" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeroCarousel profile={currentProfile} />

      {/* Quick Categories - mobile optimized */}
      <section className="relative z-10 -mt-12 md:-mt-20">
        <div className="container mx-auto px-3 md:px-4">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} to={category.link}>
                  <Card className="group border-border bg-card/90 hover:bg-card transition-colors">
                    <CardContent className="p-2.5 md:p-4">
                      <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
                        <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-[10px] md:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-[9px] md:text-xs text-muted-foreground hidden md:block">
                            {category.description}
                          </p>
                        </div>
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
        <div className="container mx-auto px-3 md:px-4 py-6 md:py-10 space-y-6 md:space-y-10">
          {user && (
            <>
              <ContinueWatching profile={currentProfile} />
              <RecentlyWatched profile={currentProfile} />
            </>
          )}
          <EnhancedMovieSection />
        </div>
      </main>
    </div>
  );
};

export default Index;
