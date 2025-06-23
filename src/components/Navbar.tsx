import React, { useState, useEffect } from "react";
import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { FlickPickLogo } from "./FlickPickLogo";
import { ProfileDisplay } from "./ProfileDisplay";
import { NotificationCenter } from "./NotificationCenter";
import { NavigationDrawer } from "./NavigationDrawer";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const navigation = [
    { name: "Home", href: "/", current: location.pathname === "/" },
    {
      name: "Browse",
      href: "/browse",
      current: location.pathname === "/browse",
    },
    {
      name: "Trending",
      href: "/trending",
      current: location.pathname === "/trending",
    },
    {
      name: "Top Rated",
      href: "/top-rated",
      current: location.pathname === "/top-rated",
    },
    {
      name: "Community",
      href: "/community",
      current: location.pathname === "/community",
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 safe-area-top ${
        isScrolled
          ? "bg-black/95 backdrop-blur-sm border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
              aria-label="Go to homepage"
            >
              <FlickPickLogo
                size="md"
                showIcon={true}
                showText={true}
                responsive={true}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`text-sm xl:text-base font-medium transition-colors hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 ${
                  item.current
                    ? "text-white bg-primary/20"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/60 border-white/20 text-white placeholder:text-gray-400 focus:bg-black/80 focus:border-white/40 h-10 lg:h-12 text-sm lg:text-base"
                />
              </div>
            </form>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user && <NotificationCenter />}
            {user ? (
              <ProfileDisplay />
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 h-10 lg:h-12 lg:px-6 transition-all hover:scale-105"
              >
                Sign In
              </Button>
            )}
            <NavigationDrawer />
          </div>

          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10 rounded-b-lg shadow-xl">
            {/* Mobile Search */}
            <div className="p-4 border-b border-white/10">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/60 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="py-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-medium transition-colors border-l-4 ${
                    item.current
                      ? "text-white bg-primary/20 border-primary"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="p-4 border-t border-white/10">
              {user ? (
                <div className="flex items-center space-x-3">
                  <ProfileDisplay />
                </div>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium h-12"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};
