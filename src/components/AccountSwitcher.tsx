
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Baby, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubAccount } from '@/types/user';

export const AccountSwitcher = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'adult' | 'teen' | 'kids'>('adult');
  
  // Get sub-accounts from user profile or default to empty array
  const userSubAccounts = (user as any)?.sub_accounts || [];
  const subAccounts: SubAccount[] = Array.isArray(userSubAccounts) ? userSubAccounts : [];
  
  const activeAccount = subAccounts.find(acc => acc.isActive) || {
    id: 'main',
    name: user?.name || user?.username || 'Main Profile',
    avatar: user?.avatar || user?.avatar_url || '👤',
    type: 'adult' as const,
    isActive: true
  };

  const handleCreateSubAccount = async () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the new profile.",
        variant: "destructive",
      });
      return;
    }

    const newAccount: SubAccount = {
      id: `sub_${Date.now()}`,
      name: newAccountName.trim(),
      avatar: getAvatarForType(newAccountType),
      type: newAccountType,
      isActive: false
    };

    try {
      const updatedSubAccounts = [...subAccounts, newAccount];
      await updateProfile({ 
        sub_accounts: updatedSubAccounts,
        active_account_type: newAccountType
      } as any);
      
      setNewAccountName('');
      setNewAccountType('adult');
      setIsDialogOpen(false);
      
      toast({
        title: "Profile created!",
        description: `${newAccount.name} profile has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSwitchAccount = async (accountId: string) => {
    try {
      const updatedSubAccounts = subAccounts.map(acc => ({
        ...acc,
        isActive: acc.id === accountId
      }));
      
      const accountType = accountId === 'main' ? 'adult' : updatedSubAccounts.find(acc => acc.id === accountId)?.type || 'adult';
      
      await updateProfile({ 
        sub_accounts: updatedSubAccounts,
        active_account_type: accountType
      } as any);
      
      const accountName = accountId === 'main' ? 'Main Profile' : updatedSubAccounts.find(acc => acc.id === accountId)?.name;
      
      toast({
        title: "Profile switched",
        description: `Switched to ${accountName}`,
      });
      
      // Refresh the page to apply content filtering
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAvatarForType = (type: string) => {
    switch (type) {
      case 'kids': return '🧒';
      case 'teen': return '👦';
      default: return '👤';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kids': return <Baby className="h-4 w-4" />;
      case 'teen': return <User className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'kids': return 'bg-green-500/20 text-green-400';
      case 'teen': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-purple-500/20 text-purple-400';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activeAccount.avatar} />
            <AvatarFallback>{activeAccount.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{activeAccount.name}</span>
            <Badge className={`text-xs ${getTypeBadgeColor(activeAccount.type)}`}>
              {getTypeIcon(activeAccount.type)}
              <span className="ml-1 capitalize">{activeAccount.type}</span>
            </Badge>
          </div>
          <Users className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-background border" align="end">
        {/* Main Account */}
        <DropdownMenuItem 
          onClick={() => handleSwitchAccount('main')}
          className={`flex items-center gap-3 p-3 ${activeAccount.id === 'main' ? 'bg-accent' : ''}`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || user?.avatar_url} />
            <AvatarFallback>{(user?.name || user?.username || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{user?.name || user?.username || 'Main Profile'}</div>
            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Adult
            </Badge>
          </div>
        </DropdownMenuItem>

        {/* Sub Accounts */}
        {subAccounts.map((account) => (
          <DropdownMenuItem 
            key={account.id}
            onClick={() => handleSwitchAccount(account.id)}
            className={`flex items-center gap-3 p-3 ${account.isActive ? 'bg-accent' : ''}`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{account.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{account.name}</div>
              <Badge className={`text-xs ${getTypeBadgeColor(account.type)}`}>
                {getTypeIcon(account.type)}
                <span className="ml-1 capitalize">{account.type}</span>
              </Badge>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Add New Profile */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Profile
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Enter profile name"
                />
              </div>
              <div>
                <Label htmlFor="type">Profile Type</Label>
                <Select value={newAccountType} onValueChange={(value: 'adult' | 'teen' | 'kids') => setNewAccountType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profile type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Adult (All Content)
                      </div>
                    </SelectItem>
                    <SelectItem value="teen">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Teen (PG-13 and below)
                      </div>
                    </SelectItem>
                    <SelectItem value="kids">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Kids (Family-friendly content)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateSubAccount} className="flex-1">
                  Create Profile
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
