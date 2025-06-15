
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User, LogIn, Baby } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AvatarSelector } from '@/components/AvatarSelector';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  age_restriction: number;
  is_child: boolean;
  user_id: string;
}

// Age restriction dropdown entries
const ageOptions = [
  { label: "All Ages", value: 0 },
  { label: "13+", value: 13 },
  { label: "16+", value: 16 },
  { label: "18+", value: 18 },
  { label: "All Content (21+)", value: 21 },
];

export const ProfileManager: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [newProfileAvatar, setNewProfileAvatar] = useState('');
  const [newIsChild, setNewIsChild] = useState(false);
  const [newAgeRestriction, setNewAgeRestriction] = useState(21);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // For editing modal fields
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editIsChild, setEditIsChild] = useState(false);
  const [editAgeRestriction, setEditAgeRestriction] = useState(21);

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
      // Load current profile from localStorage
      const savedProfile = localStorage.getItem('selectedProfile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (data?.some(p => p.id === parsed.id)) {
            setCurrentProfile(parsed);
          }
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      }
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
          avatar: newProfileAvatar || '👤',
          age_restriction: newIsChild ? 0 : newAgeRestriction,
          is_child: newIsChild
        })
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => [...prev, data]);
      setNewProfileName('');
      setNewProfileAvatar('');
      setNewIsChild(false);
      setNewAgeRestriction(21);
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

  const switchToProfile = (profile: UserProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    toast({
      title: "Profile switched",
      description: `Now using ${profile.name}'s profile`,
    });
    navigate('/'); // or window.location.reload() for hard reload
  };

  const startEditProfile = (profile: UserProfile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setEditIsChild(profile.is_child);
    setEditAgeRestriction(profile.age_restriction);
  };

  const updateProfile = async () => {
    if (!editingProfile) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editName,
          avatar: editAvatar || '👤',
          age_restriction: editIsChild ? 0 : editAgeRestriction,
          is_child: editIsChild
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === editingProfile.id
        ? { ...editingProfile, name: editName, avatar: editAvatar || '👤', age_restriction: editIsChild ? 0 : editAgeRestriction, is_child: editIsChild }
        : p
      ));
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
      // If deleted profile was current, clear it
      if (currentProfile?.id === profileId) {
        setCurrentProfile(null);
        localStorage.removeItem('selectedProfile');
      }
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
      {/* Current Profile Display */}
      {currentProfile && (
        <Card className="border-blue-600">
          <CardHeader>
            <CardTitle className="text-sm text-blue-600">Current Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentProfile.avatar} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{currentProfile.name}</h3>
              <div className="flex gap-2 mt-1">
                {currentProfile.is_child && <Badge variant="secondary">Child</Badge>}
                <Badge variant="outline">{currentProfile.age_restriction}+</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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
            <div>
              <Label>Avatar</Label>
              <AvatarSelector
                selectedAvatar={newProfileAvatar}
                onAvatarSelect={setNewProfileAvatar}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Kids Profile</Label>
              <input
                type="checkbox"
                className="ml-2"
                checked={newIsChild}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setNewIsChild(checked);
                  if (checked) setNewAgeRestriction(0);
                  else setNewAgeRestriction(21);
                }}
                id="profile-is-child"
              />
              <span>{newIsChild ? <Baby className="h-4 w-4 text-green-500" /> : null}</span>
            </div>
            {!newIsChild && (
              <div>
                <Label htmlFor="profile-age-restriction">Age Restriction</Label>
                <select
                  className="w-full px-4 py-2 border rounded"
                  id="profile-age-restriction"
                  value={newAgeRestriction}
                  onChange={e => setNewAgeRestriction(Number(e.target.value))}
                >
                  {ageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={createProfile} disabled={!newProfileName.trim()}>
                Create Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProfileName('');
                  setNewProfileAvatar('');
                  setNewIsChild(false);
                  setNewAgeRestriction(21);
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
          <Card key={profile.id} className={`relative group cursor-pointer transition-colors ${
            currentProfile?.id === profile.id ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'
          }`}>
            <CardContent className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={profile.avatar} />
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
                {currentProfile?.id === profile.id && (
                  <Badge className="bg-blue-600">Current</Badge>
                )}
              </div>
              {/* Switch Profile Button */}
              <Button
                onClick={() => switchToProfile(profile)}
                className="w-full mb-2"
                variant={currentProfile?.id === profile.id ? "secondary" : "default"}
              >
                <LogIn className="h-4 w-4 mr-2" />
                {currentProfile?.id === profile.id ? 'Current Profile' : 'Switch to Profile'}
              </Button>
              <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditProfile(profile);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProfile(profile.id);
                  }}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="editName">Profile Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div>
                <Label>Avatar</Label>
                <AvatarSelector
                  selectedAvatar={editAvatar}
                  onAvatarSelect={setEditAvatar}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Kids Profile</Label>
                <input
                  type="checkbox"
                  className="ml-2"
                  checked={editIsChild}
                  onChange={e => {
                    const checked = e.target.checked;
                    setEditIsChild(checked);
                    if (checked) setEditAgeRestriction(0);
                    else setEditAgeRestriction(21);
                  }}
                  id="edit-profile-is-child"
                />
                <span>{editIsChild ? <Baby className="h-4 w-4 text-green-500" /> : null}</span>
              </div>
              {!editIsChild && (
                <div>
                  <Label htmlFor="edit-profile-age-restriction">Age Restriction</Label>
                  <select
                    className="w-full px-4 py-2 border rounded"
                    id="edit-profile-age-restriction"
                    value={editAgeRestriction}
                    onChange={e => setEditAgeRestriction(Number(e.target.value))}
                  >
                    {ageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={updateProfile}>
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
        </div>
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
