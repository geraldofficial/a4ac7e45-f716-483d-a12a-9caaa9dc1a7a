
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  Home, 
  Grid3X3, 
  TrendingUp, 
  Star, 
  Users, 
  UserCircle, 
  Clock, 
  Menu,
  LogOut
} from 'lucide-react';

export const NavigationDrawer: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: Grid3X3 },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'Top Rated', href: '/top-rated', icon: Star },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const userNavigation = user ? [
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Profiles', href: '/profiles', icon: Users },
    { name: 'Watchlist', href: '/watchlist', icon: Clock },
    { name: 'Watch History', href: '/history', icon: Clock },
  ] : [];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-900 border-gray-700">
        <DrawerHeader className="border-b border-gray-700">
          <div className="flex items-center gap-3">
            {user && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || user.image} />
                <AvatarFallback>
                  {user.full_name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <DrawerTitle className="text-white text-left">
                {user ? (user.full_name || user.name || 'User') : 'FlickPick'}
              </DrawerTitle>
              {user && (
                <p className="text-sm text-gray-400">{user.email}</p>
              )}
            </div>
          </div>
        </DrawerHeader>
        
        <div className="p-4 space-y-2">
          {/* Main Navigation */}
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={`w-full justify-start gap-3 h-12 ${
                location.pathname === item.href
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => navigate(item.href)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Button>
          ))}

          {/* User Navigation */}
          {user && (
            <>
              <div className="border-t border-gray-700 my-4"></div>
              {userNavigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </>
          )}

          {/* Sign In Button for non-authenticated users */}
          {!user && (
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
