import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Menu, LogOut, Home, Film, Tv, History, Heart, User, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NavigationDrawer: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Tv, label: 'TV Shows', path: '/tv-shows' },
    { icon: Heart, label: 'Watchlist', path: '/watchlist' },
    { icon: History, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white p-2">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background border-border z-50 max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-foreground text-left">
            {user ? `Hi, ${user.full_name || user.email?.split('@')[0] || 'User'}` : 'Menu'}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full h-12 justify-start text-foreground hover:bg-secondary"
              onClick={() => {
                setOpen(false);
                navigate(item.path);
              }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
          
          {user && (
            <Button
              variant="destructive"
              className="w-full h-12 mt-4"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          )}
          
          {!user && (
            <Button
              className="w-full h-12 mt-4"
              onClick={() => {
                setOpen(false);
                navigate('/auth');
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
