import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, TrendingUp, Heart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: TrendingUp, label: "Trending", path: "/trending" },
    { icon: Heart, label: "Watchlist", path: user ? "/watchlist" : "/auth" },
    { icon: User, label: "Profile", path: user ? "/profile" : "/auth" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Hide on auth, watch, and onboarding pages
  const hideOnPaths = ["/auth", "/onboarding", "/watch"];
  const shouldHide = hideOnPaths.some((path) => location.pathname.startsWith(path));
  if (shouldHide) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-14 safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
