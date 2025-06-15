
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarSelector } from '@/components/AvatarSelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  is_child: boolean;
  age_restriction: number;
}

interface ProfileSelectorProps {
  onProfileSelect: (profile: UserProfile) => void;
  currentProfileId?: string;
}

const generateDefaultAvatar = () => {
  const seeds = ['Alex', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava'];
  const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onProfileSelect,
  currentProfileId
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: generateDefaultAvatar(),
    is_child: false,
    age_restriction: 21 // Changed default to 21 (All content)
  });

  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const finalData = {
        ...profileData,
        age_restriction: profileData.is_child ? 0 : profileData.age_restriction
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...finalData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success('Profile created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create profile: ' + error.message);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<typeof formData> }) => {
      const finalUpdates = {
        ...updates,
        age_restriction: updates.is_child ? 0 : updates.age_restriction
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      setEditingProfile(null);
      resetForm();
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      toast.success('Profile deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete profile: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      avatar: generateDefaultAvatar(),
      is_child: false,
      age_restriction: 21 // Changed default to 21 (All content)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, updates: formData });
    } else {
      createProfileMutation.mutate(formData);
    }
  };

  const handleEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar: profile.avatar,
      is_child: profile.is_child,
      age_restriction: profile.age_restriction
    });
  };

  const handleDelete = (profileId: string) => {
    if (profiles.length <= 1) {
      toast.error('Cannot delete the last profile');
      return;
    }
    if (confirm('Are you sure you want to delete this profile?')) {
      deleteProfileMutation.mutate(profileId);
    }
  };

  const renderAvatar = (avatar: string) => {
    return (
      <img 
        src={avatar} 
        alt="Profile avatar"
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          e.currentTarget.src = generateDefaultAvatar();
        }}
      />
    );
  };

  const getAgeDisplay = (profile: UserProfile) => {
    if (profile.is_child) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <Baby className="w-3 h-3" />
          <span>Kids</span>
        </div>
      );
    }
    if (profile.age_restriction >= 21) {
      return <span className="text-white/60">All Content</span>;
    }
    return <span className="text-white/60">{profile.age_restriction}+</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Who's watching?</h1>
          <p className="text-white/70">Select a profile to continue</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20 ${
                currentProfileId === profile.id ? 'ring-2 ring-purple-400' : ''
              } ${profile.is_child ? 'border-green-400/50' : ''}`}
              onClick={() => onProfileSelect(profile)}
            >
              <div className="p-6 text-center">
                <div className="relative mb-4">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center overflow-hidden ${
                    profile.is_child 
                      ? 'bg-gradient-to-br from-green-400 to-blue-400' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-500'
                  }`}>
                    {renderAvatar(profile.avatar)}
                  </div>
                  {profile.is_child && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Baby className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-white font-medium truncate mb-1">{profile.name}</h3>
                {getAgeDisplay(profile)}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(profile);
                      }}
                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                    >
                      <Edit2 className="h-3 w-3 text-white" />
                    </Button>
                    {profiles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(profile.id);
                        }}
                        className="h-8 w-8 p-0 bg-red-500/60 hover:bg-red-500/80"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/20 border-dashed hover:border-white/40">
                <div className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto border-2 border-dashed border-white/40 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-white/60" />
                  </div>
                  <h3 className="text-white/60 font-medium">Add Profile</h3>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingProfile ? 'Edit Profile' : 'Create New Profile'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white">Profile Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter profile name"
                    required
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Avatar</Label>
                  <AvatarSelector
                    selectedAvatar={formData.avatar}
                    onAvatarSelect={(avatar) => setFormData({ ...formData, avatar })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-400/20">
                  <div>
                    <Label htmlFor="is_child" className="text-white font-medium">Kids Profile</Label>
                    <p className="text-sm text-green-300">Safe content for children with animations and cartoons</p>
                  </div>
                  <Switch
                    id="is_child"
                    checked={formData.is_child}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      is_child: checked,
                      age_restriction: checked ? 0 : 21 
                    })}
                  />
                </div>

                {!formData.is_child && (
                  <div>
                    <Label htmlFor="age_restriction" className="text-white">Age Restriction</Label>
                    <Select
                      value={formData.age_restriction.toString()}
                      onValueChange={(value) => setFormData({ ...formData, age_restriction: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Ages</SelectItem>
                        <SelectItem value="13">13+</SelectItem>
                        <SelectItem value="16">16+</SelectItem>
                        <SelectItem value="18">18+</SelectItem>
                        <SelectItem value="21">All Content (21+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingProfile(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  >
                    {editingProfile ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-white">Profile Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter profile name"
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Avatar</Label>
                <AvatarSelector
                  selectedAvatar={formData.avatar}
                  onAvatarSelect={(avatar) => setFormData({ ...formData, avatar })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-400/20">
                <div>
                  <Label htmlFor="edit-is_child" className="text-white font-medium">Kids Profile</Label>
                  <p className="text-sm text-green-300">Safe content for children with animations and cartoons</p>
                </div>
                <Switch
                  id="edit-is_child"
                  checked={formData.is_child}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    is_child: checked,
                    age_restriction: checked ? 0 : 21 
                  })}
                />
              </div>

              {!formData.is_child && (
                <div>
                  <Label htmlFor="edit-age_restriction" className="text-white">Age Restriction</Label>
                  <Select
                    value={formData.age_restriction.toString()}
                    onValueChange={(value) => setFormData({ ...formData, age_restriction: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Ages</SelectItem>
                      <SelectItem value="13">13+</SelectItem>
                      <SelectItem value="16">16+</SelectItem>
                      <SelectItem value="18">18+</SelectItem>
                      <SelectItem value="21">All Content (21+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateProfileMutation.isPending}
                >
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
