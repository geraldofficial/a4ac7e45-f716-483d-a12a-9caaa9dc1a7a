
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  age_restriction: number;
  is_child: boolean;
  user_id: string;
}

export const ProfileManager: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user || !newProfileName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: newProfileName.trim(),
          avatar: '👤',
          age_restriction: 18,
          is_child: false
        })
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => [...prev, data]);
      setNewProfileName('');
      setShowCreateForm(false);
      
      toast({
        title: "Success",
        description: "Profile created successfully!",
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profile.name,
          avatar: profile.avatar,
          age_restriction: profile.age_restriction,
          is_child: profile.is_child
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === profile.id ? profile : p));
      setEditingProfile(null);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.id !== profileId));
      
      toast({
        title: "Success",
        description: "Profile deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  const generateAvatar = (name: string) => {
    const seed = name.toLowerCase().replace(/\s/g, '');
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-24 mx-auto mb-2"></div>
              <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Profiles</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="gap-2"
          disabled={profiles.length >= 5}
        >
          <Plus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      {/* Create Profile Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profileName">Profile Name</Label>
              <Input
                id="profileName"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter profile name"
                maxLength={30}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createProfile} disabled={!newProfileName.trim()}>
                Create Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProfileName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => (
          <Card key={profile.id} className="relative group">
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={generateAvatar(profile.name)} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold mb-2">{profile.name}</h3>
              
              <div className="flex justify-center gap-2 mb-4">
                {profile.is_child && (
                  <Badge variant="secondary">Child</Badge>
                )}
                <Badge variant="outline">
                  {profile.age_restriction}+
                </Badge>
              </div>

              <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingProfile(profile)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteProfile(profile.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="editName">Profile Name</Label>
              <Input
                id="editName"
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                maxLength={30}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => updateProfile(editingProfile)}>
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingProfile(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {profiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No profiles yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first profile to get started
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
