import React, { useEffect, useState } from "react";
import { EnhancedHeroCarousel } from "@/components/hero/EnhancedHeroCarousel";
import { EnhancedMovieSection } from "@/components/EnhancedMovieSection";
import { ContinueWatching } from "@/components/ContinueWatching";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { useAuthState } from "@/hooks/useAuthState";
import { Play, TrendingUp, Star, Users, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuthState();
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
      description: "The hottest movies and shows everyone is talking about",
      icon: TrendingUp,
      link: "/trending",
      gradient: "from-red-600 to-pink-600",
    },
    {
      title: "Top Rated",
      description: "Critically acclaimed content with the highest ratings",
      icon: Star,
      link: "/top-rated",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      title: "Community Picks",
      description: "Discover what our community loves most",
      icon: Users,
      link: "/community",
      gradient: "from-blue-600 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <EnhancedHeroCarousel profile={currentProfile} />

      {/* Featured Categories */}
      <section className="bg-gray-950 relative z-10">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Our Collection
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From blockbuster hits to hidden gems, find exactly what you're
              looking for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {featuredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} to={category.link}>
                  <Card className="group border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                      />
                      <div className="relative z-10">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {category.description}
                        </p>
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
        <div className="container mx-auto px-4 py-16 space-y-16">
          {user && (
            <>
              <ContinueWatching profile={currentProfile} />
              <RecentlyWatched profile={currentProfile} />
            </>
          )}

          <EnhancedMovieSection />

          {/* Stats Section */}
          <section className="bg-gray-900/50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Join Millions of Movie Lovers
              </h2>
              <p className="text-gray-400">
                Be part of the largest streaming community
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
                  50K+
                </div>
                <div className="text-gray-400">Movies & Shows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
                  2M+
                </div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
                  98%
                </div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
                  4.9
                </div>
                <div className="text-gray-400">User Rating</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
