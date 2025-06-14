
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, TrendingUp, Star } from 'lucide-react';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Star, label: 'Top Rated', path: '/top-rated' },
    { icon: Heart, label: 'Donate', path: '/support' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-bottom-nav bg-background/98 backdrop-blur-3xl border-t border-border/60 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-1 rounded-t-2xl bg-background/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-h-[64px] min-w-[64px] mobile-touch-target active:scale-95 ${
                isActive(item.path) 
                  ? 'text-primary bg-primary/15 scale-105 shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive(item.path) ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs font-medium leading-none ${isActive(item.path) ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
