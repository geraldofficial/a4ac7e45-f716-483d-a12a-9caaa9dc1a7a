import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Heart,
  Bell,
  Menu,
  X,
  Play,
  TrendingUp,
  Users,
  Star,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Browse", href: "/", icon: Play },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Top Rated", href: "/top-rated", icon: Star },
  { name: "Community", href: "/community", icon: Users },
];

export const ModernNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { signOut } = useAuthActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FlickPick</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search movies, shows, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white relative"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-xs">
                    3
                  </Badge>
                </Button>

                {/* Watchlist */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate("/watchlist")}
                  className="text-gray-400 hover:text-white"
                >
                  <Heart className="h-5 w-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar}
                          alt={user.username || user.email}
                        />
                        <AvatarFallback>
                          {(user.username ||
                            user.email ||
                            "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-gray-900 border-gray-800"
                    align="end"
                  >
                    <DropdownMenuLabel className="text-gray-200">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.full_name || user.username || "User"}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/watchlist")}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Watchlist
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/history")}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch History
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-80 bg-gray-950 border-gray-800 p-0"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          FlickPick
                        </span>
                      </Link>
                    </div>

                    {/* Mobile Search */}
                    <div className="p-4 border-b border-gray-800">
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </form>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 p-4 space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                              isActive(item.href)
                                ? "bg-red-600 text-white"
                                : "text-gray-300 hover:text-white hover:bg-gray-800",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Mobile User Section */}
                    {user && (
                      <div className="border-t border-gray-800 p-4 space-y-2">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {(user.username ||
                                user.email ||
                                "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">
                              {user.full_name || user.username}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate("/profile");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-gray-300 hover:text-white"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start text-red-400 hover:text-red-300"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
