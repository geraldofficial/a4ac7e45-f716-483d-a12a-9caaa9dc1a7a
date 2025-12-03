import React, { useState, useEffect } from 'react';
import { ModernNavbar } from '@/components/layout/ModernNavbar';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setUsername(user.username || '');
    setSelectedAvatar(user.avatar || 'https://api.dicebear.com/8.x/notionists/svg?seed=Alex');
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim(), avatar: selectedAvatar })
        .eq('id', user.id);

      if (error) throw error;
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
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <ModernNavbar />
      
      <div className="md:pt-20 py-6 px-4">
        <div className="container mx-auto max-w-lg">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 h-8 px-2" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-4 space-y-6">
            <AvatarSelector selectedAvatar={selectedAvatar} onAvatarSelect={setSelectedAvatar} />

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="bg-background/30 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading || !username.trim()}
              className="w-full"
            >
              {loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
