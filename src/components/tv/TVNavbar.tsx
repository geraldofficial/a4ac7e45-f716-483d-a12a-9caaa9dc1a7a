import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Film,
  Tv,
  TrendingUp,
  Users,
  Search,
  Download,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTVNavigation } from "@/hooks/useTVNavigation";
import { useTVGuest } from "@/contexts/TVGuestContext";
import { useAuth } from "@/contexts/AuthContext";

const TVNavbar: React.FC = () => {
  const location = useLocation();
  const { isTVMode, isGuestMode, toggleTVMode } = useTVGuest();
  const { user, signOut } = useAuth();
  const { isTVMode: navTVMode } = useTVNavigation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Movies", href: "/movies", icon: Film },
    { name: "TV Shows", href: "/tv", icon: Tv },
    { name: "Trending", href: "/trending", icon: TrendingUp },
    { name: "Community", href: "/community", icon: Users },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isTVMode && !navTVMode) {
    return null; // Use regular navbar for non-TV mode
  }

  return (
    <>
      {/* TV Skip Link */}
      <a href="#main-content" className="tv-skip-link">
        Skip to main content
      </a>

      <nav className="tv-nav">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="tv-nav-item" data-tv-focusable>
            <div className="flex items-center space-x-3">
              <img
                src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=80"
                alt="FlickPick"
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-white">FlickPick</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`tv-nav-item ${isActive ? "bg-red-600" : ""}`}
                  data-tv-focusable
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={24} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="lg"
              className="tv-nav-item"
              data-tv-focusable
              onClick={() => {
                const searchInput = document.querySelector(
                  "[data-search-input]",
                ) as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                }
              }}
            >
              <Search size={24} />
              <span className="ml-2">Search</span>
            </Button>

            {/* Guest Mode / User Menu */}
            {isGuestMode || !user ? (
              <div className="flex items-center space-x-2">
                <div className="tv-guest-banner text-sm px-3 py-1 rounded-full">
                  Guest Mode
                </div>

                <Link to="/auth" className="tv-nav-item" data-tv-focusable>
                  <div className="flex items-center space-x-2">
                    <User size={20} />
                    <span>Sign In</span>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="tv-nav-item" data-tv-focusable>
                  <div className="flex items-center space-x-2">
                    <User size={20} />
                    <span>{user.username || "Profile"}</span>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="lg"
                  className="tv-nav-item"
                  onClick={handleSignOut}
                  data-tv-focusable
                >
                  <LogOut size={20} />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </div>
            )}

            {/* TV Mode Toggle */}
            <Button
              variant="outline"
              size="lg"
              className="tv-nav-item"
              onClick={toggleTVMode}
              data-tv-focusable
            >
              <Settings size={20} />
              <span className="ml-2">TV Mode</span>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TVNavbar;
