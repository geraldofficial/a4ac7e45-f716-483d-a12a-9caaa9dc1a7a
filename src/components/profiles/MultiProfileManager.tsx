import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Child,
  Shield,
  Check,
  X,
  Settings,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  is_child: boolean;
  is_main: boolean;
  age_restriction: number;
  genre_preferences: string[];
  language: string;
  created_at: string;
  last_used: string;
}

interface ProfileFormData {
  name: string;
  avatar: string;
  is_child: boolean;
  age_restriction: number;
  genre_preferences: string[];
  language: string;
}

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/8.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Sam&backgroundColor=c0aede",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Jordan&backgroundColor=d1d4f9",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Casey&backgroundColor=ffd5dc",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Riley&backgroundColor=ffdfbf",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Morgan&backgroundColor=c7f0c7",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Avery&backgroundColor=ffc9c9",
  "https://api.dicebear.com/8.x/notionists/svg?seed=Parker&backgroundColor=b6e3f4",
];

const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "TV Movie",
  "Thriller",
  "War",
  "Western",
];

export const MultiProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    avatar: AVATAR_OPTIONS[0],
    is_child: false,
    age_restriction: 18,
    genre_preferences: [],
    language: "en",
  });

  useEffect(() => {
    if (user) {
      fetchProfiles();
      loadCurrentProfile();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_main", { ascending: false });

      if (error) throw error;

      const formattedProfiles: UserProfile[] = (data || []).map((profile) => ({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        is_child: profile.is_child,
        is_main: profile.is_main,
        age_restriction: profile.age_restriction,
        genre_preferences: profile.genre_preferences || [],
        language: profile.language || "en",
        created_at: profile.created_at,
        last_used: profile.last_used || profile.created_at,
      }));

      setProfiles(formattedProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", formatError(error));
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentProfile = () => {
    const savedProfile = localStorage.getItem("selectedProfile");
    if (savedProfile) {
      try {
        setCurrentProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error parsing saved profile:", error);
        localStorage.removeItem("selectedProfile");
      }
    }
  };

  const createProfile = async () => {
    try {
      if (!user) return;

      // Check profile limit (max 5 profiles per user)
      if (profiles.length >= 5) {
        toast.error("Maximum 5 profiles allowed per account");
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          name: formData.name,
          avatar: formData.avatar,
          is_child: formData.is_child,
          is_main: profiles.length === 0, // First profile is main
          age_restriction: formData.age_restriction,
          genre_preferences: formData.genre_preferences,
          language: formData.language,
          last_used: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Profile created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchProfiles();
    } catch (error) {
      console.error("Error creating profile:", formatError(error));
      toast.error("Failed to create profile");
    }
  };

  const updateProfile = async () => {
    try {
      if (!editingProfile) return;

      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: formData.name,
          avatar: formData.avatar,
          is_child: formData.is_child,
          age_restriction: formData.age_restriction,
          genre_preferences: formData.genre_preferences,
          language: formData.language,
        })
        .eq("id", editingProfile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditDialogOpen(false);
      setEditingProfile(null);
      resetForm();
      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", formatError(error));
      toast.error("Failed to update profile");
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const profile = profiles.find((p) => p.id === profileId);
      if (profile?.is_main) {
        toast.error("Cannot delete main profile");
        return;
      }

      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", profileId);

      if (error) throw error;

      toast.success("Profile deleted successfully!");

      // If deleted profile was current, switch to main
      if (currentProfile?.id === profileId) {
        const mainProfile = profiles.find((p) => p.is_main);
        if (mainProfile) {
          switchProfile(mainProfile);
        }
      }

      fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", formatError(error));
      toast.error("Failed to delete profile");
    }
  };

  const switchProfile = async (profile: UserProfile) => {
    try {
      // Update last_used timestamp
      await supabase
        .from("user_profiles")
        .update({ last_used: new Date().toISOString() })
        .eq("id", profile.id);

      setCurrentProfile(profile);
      localStorage.setItem("selectedProfile", JSON.stringify(profile));
      toast.success(`Switched to ${profile.name}'s profile`);

      // Refresh the page to apply profile settings
      window.location.reload();
    } catch (error) {
      console.error("Error switching profile:", formatError(error));
      toast.error("Failed to switch profile");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (profile: UserProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar: profile.avatar,
      is_child: profile.is_child,
      age_restriction: profile.age_restriction,
      genre_preferences: profile.genre_preferences,
      language: profile.language,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      avatar: AVATAR_OPTIONS[0],
      is_child: false,
      age_restriction: 18,
      genre_preferences: [],
      language: "en",
    });
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre_preferences: prev.genre_preferences.includes(genre)
        ? prev.genre_preferences.filter((g) => g !== genre)
        : [...prev.genre_preferences, genre],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick"
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Profiles</h1>
            <p className="text-gray-400">
              Create and manage viewing profiles for your account
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {/* Current Profile */}
      {currentProfile && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Current Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentProfile.avatar} />
                <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">
                  {currentProfile.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {currentProfile.is_main && (
                    <Badge variant="default" className="bg-blue-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Main
                    </Badge>
                  )}
                  {currentProfile.is_child && (
                    <Badge variant="secondary">
                      <Child className="h-3 w-3 mr-1" />
                      Child
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Age {currentProfile.age_restriction}+
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {currentProfile.genre_preferences.length} genres selected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={`border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-all cursor-pointer ${
              currentProfile?.id === profile.id ? "ring-2 ring-red-600" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold text-white">{profile.name}</h3>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    {profile.is_main && (
                      <Badge variant="default" className="bg-blue-600 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Main
                      </Badge>
                    )}
                    {profile.is_child && (
                      <Badge variant="secondary" className="text-xs">
                        <Child className="h-3 w-3 mr-1" />
                        Child
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Age {profile.age_restriction}+ •{" "}
                    {profile.genre_preferences.length} genres
                  </p>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchProfile(profile)}
                    className="text-green-400 border-green-400/50 hover:bg-green-400/10"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                    className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!profile.is_main && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProfile(profile.id)}
                      className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Profile Card */}
        {profiles.length < 5 && (
          <Card
            className="border-gray-800 bg-gray-900/30 border-dashed hover:bg-gray-900/50 transition-all cursor-pointer"
            onClick={openCreateDialog}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-400">Add Profile</h3>
                  <p className="text-gray-500 text-sm">
                    Create a new viewing profile
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up a new viewing profile with personalized settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Profile Name</Label>
                <Input
                  placeholder="Enter profile name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Avatar</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-colors ${
                        formData.avatar === avatar
                          ? "border-red-600 bg-red-600/20"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, avatar }))
                      }
                    >
                      <Avatar className="h-12 w-12 mx-auto">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Child Profile</Label>
                  <p className="text-sm text-gray-400">
                    Enable child-safe content filtering
                  </p>
                </div>
                <Switch
                  checked={formData.is_child}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_child: checked,
                      age_restriction: checked ? 13 : 18,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-gray-300">Age Restriction</Label>
                <Select
                  value={formData.age_restriction.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      age_restriction: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Ages</SelectItem>
                    <SelectItem value="13">13+</SelectItem>
                    <SelectItem value="16">16+</SelectItem>
                    <SelectItem value="18">18+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Preferred Genres</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <Button
                      key={genre}
                      variant={
                        formData.genre_preferences.includes(genre)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`justify-start text-xs ${
                        formData.genre_preferences.includes(genre)
                          ? "bg-red-600 hover:bg-red-700"
                          : "border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createProfile}
              disabled={!formData.name.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update profile settings and preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Same form content as create dialog */}
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Profile Name</Label>
                <Input
                  placeholder="Enter profile name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Avatar</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-lg p-2 border-2 transition-colors ${
                        formData.avatar === avatar
                          ? "border-red-600 bg-red-600/20"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, avatar }))
                      }
                    >
                      <Avatar className="h-12 w-12 mx-auto">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Child Profile</Label>
                  <p className="text-sm text-gray-400">
                    Enable child-safe content filtering
                  </p>
                </div>
                <Switch
                  checked={formData.is_child}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_child: checked,
                      age_restriction: checked ? 13 : 18,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-gray-300">Age Restriction</Label>
                <Select
                  value={formData.age_restriction.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      age_restriction: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Ages</SelectItem>
                    <SelectItem value="13">13+</SelectItem>
                    <SelectItem value="16">16+</SelectItem>
                    <SelectItem value="18">18+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Preferred Genres</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <Button
                      key={genre}
                      variant={
                        formData.genre_preferences.includes(genre)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`justify-start text-xs ${
                        formData.genre_preferences.includes(genre)
                          ? "bg-red-600 hover:bg-red-700"
                          : "border-gray-700 text-gray-300 hover:bg-gray-800"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={updateProfile}
              disabled={!formData.name.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
