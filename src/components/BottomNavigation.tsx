
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
    <nav className="mobile-nav">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`mobile-nav-item ${
                active 
                  ? 'text-primary bg-primary/15 scale-105' 
                  : 'text-muted-foreground active:text-foreground active:bg-accent/70'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
