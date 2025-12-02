import React, { useEffect, useState } from "react";
import { EnhancedHeroCarousel } from "@/components/hero/EnhancedHeroCarousel";
import { EnhancedMovieSection } from "@/components/EnhancedMovieSection";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { useAuth } from "@/contexts/AuthContext";
import { Play, TrendingUp, Star, Users, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    // Get the selected profile from localStorage with error handling
    const savedProfile = localStorage.getItem("selectedProfile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setCurrentProfile(parsedProfile);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
        localStorage.removeItem("selectedProfile"); // Clean up corrupted data
      }
    }
  }, []);

  const featuredCategories = [
    {
      title: "Trending Now",
      description: "What's hot right now",
      icon: TrendingUp,
      link: "/trending",
    },
    {
      title: "Top Rated",
      description: "Highest rated content",
      icon: Star,
      link: "/top-rated",
    },
    {
      title: "Community",
      description: "Join the conversation",
      icon: Users,
      link: "/community",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <EnhancedHeroCarousel profile={currentProfile} />

      {/* Featured Categories */}
      <section className="bg-gray-950 relative z-10 -mt-32">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} to={category.link}>
                  <Card className="group border-gray-800 bg-gray-900/80 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-400 hidden md:block">
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
      <main className="bg-gray-950 relative z-10">
        <div className="container mx-auto px-4 py-12 space-y-12">
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
