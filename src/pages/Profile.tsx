
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setUsername(user.username || '');
    setSelectedAvatar(user.avatar || 'https://api.dicebear.com/8.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf');
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    triggerHaptic();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          avatar: selectedAvatar
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local auth context
      await updateProfile({ username: username.trim(), avatar: selectedAvatar });
      
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-24 md:pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                triggerHaptic();
                navigate(-1);
              }}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-3 mb-8">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
            </div>
          </div>

          <div className="bg-background/40 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 space-y-8">
            {/* Avatar Selection */}
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarSelect={setSelectedAvatar}
            />

            {/* Username Input */}
            <div className="space-y-3">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-background/40 backdrop-blur-xl border-border/50"
              />
            </div>

            {/* Email Display */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="bg-background/20 backdrop-blur-xl border-border/30 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || !username.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
