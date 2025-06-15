
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NavigationDrawer: React.FC<{ onOpenWatchParty?: () => void }> = ({ onOpenWatchParty }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white">
          <Users className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-900 border-gray-700 z-50">
        <DrawerHeader>
          <DrawerTitle className="text-white text-left">Menu</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-3">
          <Button
            className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold"
            onClick={() => {
              setOpen(false);
              if (onOpenWatchParty) onOpenWatchParty();
              else navigate('/watch-party');
            }}
          >
            Watch Party Room
          </Button>
          <Button
            className="w-full h-12 bg-black text-red-500 border border-red-700 rounded-lg font-semibold"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
