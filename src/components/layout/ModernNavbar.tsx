import React, { useState, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Heart,
  Bell,
  Home,
  Film,
  Tv,
  TrendingUp,
  Users,
  MessageCircle,
  Crown,
  Plus,
  ChevronDown,
  Star,
  History,
  Bookmark,
  Download,
  Play,
  Eye,
  Calendar,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SimpleNotificationBell from "@/components/notifications/SimpleNotificationBell";
import QuickWatchPartyDialog from "@/components/QuickWatchPartyDialog";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Browse", href: "/browse", icon: Film },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "TV Shows", href: "/tv", icon: Tv },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Community", href: "/community", icon: Users },
];

export const ModernNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWatchPartyDialog, setShowWatchPartyDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
                  alt="FlickPick"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-600"
                  />
                </div>
              </form>
            </div>

            {/* Right Side - Auth & User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <SimpleNotificationBell />

                  {/* Watch Party */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWatchPartyDialog(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Users className="h-5 w-5" />
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar}
                            alt={user.username || user.email}
                          />
                          <AvatarFallback>
                            {(user.username || user.email || "User")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-gray-900 border-gray-700 text-white"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {user.full_name || user.username || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profiles" className="cursor-pointer">
                          <UserCircle className="mr-2 h-4 w-4" />
                          Manage Profiles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Account Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/watchlist" className="cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" />
                          Watchlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/history" className="cursor-pointer">
                          <History className="mr-2 h-4 w-4" />
                          Watch History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-400 hover:text-red-300"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    asChild
                    className="text-gray-300 hover:text-white"
                  >
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-white"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-80 bg-gray-950 border-gray-800 text-white"
                  >
                    <div className="flex flex-col h-full">
                      {/* Mobile Header */}
                      <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                        {user && (
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {(user.username || user.email || "User")
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <p className="font-medium text-white">
                                {user.full_name || user.username}
                              </p>
                              <p className="text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Search */}
                      <div className="py-4 border-b border-gray-800">
                        <form onSubmit={handleSearch}>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                        </form>
                      </div>

                      {/* Mobile Navigation */}
                      <div className="flex-1 py-4 overflow-y-auto lg:hidden">
                        <div className="space-y-1">
                          {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                  isActive(item.href)
                                    ? "bg-red-600 text-white"
                                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>

                        {user && (
                          <>
                            <div className="border-t border-gray-800 mt-6 pt-6">
                              <div className="space-y-1">
                                <Link
                                  to="/profiles"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                  <UserCircle className="h-5 w-5" />
                                  <span>Manage Profiles</span>
                                </Link>
                                <Link
                                  to="/profile"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                  <User className="h-5 w-5" />
                                  <span>Account Settings</span>
                                </Link>
                                <Link
                                  to="/watchlist"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                  <Heart className="h-5 w-5" />
                                  <span>Watchlist</span>
                                </Link>
                                <Link
                                  to="/history"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                  <History className="h-5 w-5" />
                                  <span>Watch History</span>
                                </Link>
                                <Link
                                  to="/settings"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                                >
                                  <Settings className="h-5 w-5" />
                                  <span>Settings</span>
                                </Link>
                              </div>
                            </div>

                            <div className="border-t border-gray-800 pt-6">
                              <button
                                onClick={() => {
                                  handleSignOut();
                                  setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 w-full"
                              >
                                <LogOut className="h-5 w-5" />
                                <span>Sign out</span>
                              </button>
                            </div>
                          </>
                        )}

                        {!user && (
                          <div className="border-t border-gray-800 mt-6 pt-6 space-y-2">
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-gray-700 text-gray-300 hover:text-white"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Link to="/auth">Sign In</Link>
                            </Button>
                            <Button
                              asChild
                              className="w-full bg-red-600 hover:bg-red-700"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Link to="/auth">Get Started</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Mobile Search Toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-gray-300 hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-600"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};
