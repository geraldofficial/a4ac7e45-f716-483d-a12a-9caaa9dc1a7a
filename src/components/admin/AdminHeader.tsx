
import React from 'react';
import { Button } from '@/components/ui/button';
import { FlickPickLogo } from '@/components/FlickPickLogo';
import { Bell, Settings, User } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FlickPickLogo size="sm" />
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
