import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Heart,
  TrendingUp,
  Star,
  User,
  Clock,
  Users,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/", priority: true },
    { icon: Search, label: "Search", path: "/search", priority: true },
    { icon: TrendingUp, label: "Trending", path: "/trending", priority: true },
    { icon: Star, label: "Top Rated", path: "/top-rated", priority: false },
    { icon: Users, label: "Community", path: "/community", priority: false },
    ...(user
      ? [{ icon: Clock, label: "History", path: "/history", priority: false }]
      : []),
    { icon: Heart, label: "Support", path: "/support", priority: false },
  ];

  // Show only priority items on very small screens
  const itemsToShow =
    window.innerWidth < 360
      ? navItems.filter((item) => item.priority)
      : navItems;

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Hide bottom nav on certain pages
  const hideOnPaths = ["/auth", "/onboarding"];
  const shouldHide = hideOnPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {itemsToShow.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 group touch-manipulation ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground active:text-primary active:scale-95"
                }`}
                aria-label={item.label}
              >
                <div
                  className={`transition-transform duration-200 ${
                    active ? "scale-110" : "group-active:scale-90"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs mt-1 transition-all duration-200 ${
                    active ? "font-medium" : "font-normal"
                  } ${itemsToShow.length > 5 ? "hidden" : "block"}`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile content */}
      <div className="md:hidden h-16 safe-area-bottom" />

      {/* TV/Large Screen Side Navigation */}
      <div className="hidden 2xl:block fixed left-0 top-1/2 transform -translate-y-1/2 z-40">
        <div className="bg-background/90 backdrop-blur-lg border border-border/50 rounded-r-xl p-3 space-y-3">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "text-primary bg-primary/10 shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <Icon
                  className={`h-6 w-6 transition-transform duration-200 ${
                    active ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
