
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AccountSwitcher } from '../AccountSwitcher';
import { useAuth } from '@/contexts/AuthContext';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {/* Account Switcher for multiple profiles */}
        <AccountSwitcher />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" style={{ touchAction: 'manipulation' }}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || user.avatar_url || user.image} alt={user.name || user.username || 'User'} />
                <AvatarFallback>{(user.name || user.username || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-3xl border-border/50" align="end">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/watchlist')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Watchlist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/auth')}
        className="bg-background/50 backdrop-blur-xl border border-border/50 hover:bg-background/70"
        style={{ touchAction: 'manipulation' }}
      >
        Sign In
      </Button>
    </div>
  );
};
