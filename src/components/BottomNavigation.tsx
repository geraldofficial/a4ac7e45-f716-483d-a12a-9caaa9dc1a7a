
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, TrendingUp, Star, User, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Support', path: '/support' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Star, label: 'Top Rated', path: '/top-rated' },
    ...(user ? [{ icon: Clock, label: 'History', path: '/history' }] : []),
    { icon: User, label: user ? 'Profile' : 'Sign In', path: user ? '/profile' : '/auth' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive(item.path) 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
              }`}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
