
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, User } from 'lucide-react';

export const AccountSwitcher: React.FC = () => {
  // For now, this is a placeholder component
  // In the future, this could support multiple user profiles
  const profiles = [
    { id: 1, name: 'Main Profile', avatar: null }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback className="text-xs">M</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm">Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-3xl border-border/50" align="end">
        {profiles.map((profile) => (
          <DropdownMenuItem key={profile.id} className="cursor-pointer">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-xs">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {profile.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
