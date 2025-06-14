
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: Search, label: 'Search', to: '/search' },
    { icon: Bookmark, label: 'Watchlist', to: '/watchlist', requireAuth: true },
    { icon: User, label: 'Profile', to: user ? '/profile' : '/auth' },
  ];

  // Only show on mobile and hide on certain pages
  const hiddenRoutes = ['/auth', '/onboarding'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-gray-800 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, to, requireAuth }) => {
          // Skip watchlist if user not authenticated
          if (requireAuth && !user) return null;

          const isActive = location.pathname === to;

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors duration-200`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
