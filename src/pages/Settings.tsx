import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Play,
  Eye,
  Palette,
  Globe,
  Volume2,
  Smartphone,
  Users,
  Settings as SettingsIcon,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";

interface UserSettings {
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  communityNotifications: boolean;

  // Privacy settings
  profileVisibility: "public" | "friends" | "private";
  showWatchHistory: boolean;
  dataCollection: boolean;

  // Playback preferences
  autoplay: boolean;
  videoQuality: "auto" | "480p" | "720p" | "1080p" | "4k";
  subtitlesEnabled: boolean;
  subtitleLanguage: string;

  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;

  // Language & Region
  language: string;
  region: string;
  timezone: string;
}

const Settings = () => {
  const { user, currentProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    communityNotifications: true,
    profileVisibility: "public",
    showWatchHistory: true,
    dataCollection: true,
    autoplay: true,
    videoQuality: "auto",
    subtitlesEnabled: false,
    subtitleLanguage: "en",
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    language: "en",
    region: "US",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadUserSettings();
  }, [user, navigate]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // Not found error is OK
        console.error("Error loading settings:", error);
        return;
      }

      if (data) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    setSaveMessage("");

    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        settings: settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-6 w-6 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>

            {currentProfile && (
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="h-4 w-4" />
                <span>Profile: {currentProfile.name}</span>
                <Badge variant="outline" className="text-xs">
                  {currentProfile.age_restriction}+
                </Badge>
              </div>
            )}
          </div>

          {/* Save Message */}
          {saveMessage && (
            <Alert
              className={`mb-6 ${saveMessage.includes("success") ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
            >
              <Check className="h-4 w-4" />
              <AlertDescription
                className={
                  saveMessage.includes("success")
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
              <TabsTrigger
                value="account"
                className="text-gray-300 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-1" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4 mr-1" />
                Privacy
              </TabsTrigger>
              <TabsTrigger
                value="playback"
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                Playback
              </TabsTrigger>
              <TabsTrigger
                value="accessibility"
                className="text-gray-300 data-[state=active]:text-white"
              >
                <Eye className="h-4 w-4 mr-1" />
                Accessibility
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white">
                    Account Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account details and profile settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        value={user.email || ""}
                        disabled
                        className="bg-gray-800 border-gray-700 text-gray-400"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Username</Label>
                      <Input
                        value={user.username || ""}
                        disabled
                        className="bg-gray-800 border-gray-700 text-gray-400"
                      />
                      <Link
                        to="/profile"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Edit profile <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">
                      Profile Management
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Manage multiple viewing profiles for different family
                      members
                    </p>
                    <Link to="/profiles">
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:text-white"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Profiles
                      </Button>
                    </Link>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Language</Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            updateSetting("language", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="it">Italiano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Region</Label>
                        <Select
                          value={settings.region}
                          onValueChange={(value) =>
                            updateSetting("region", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="BR">Brazil</SelectItem>
                            <SelectItem value="MX">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose which notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get updates via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          updateSetting("emailNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Get browser notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          updateSetting("pushNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">
                          Community Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Updates from community posts and messages
                        </p>
                      </div>
                      <Switch
                        checked={settings.communityNotifications}
                        onCheckedChange={(checked) =>
                          updateSetting("communityNotifications", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white">
                    Privacy & Security
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Control your privacy and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Profile Visibility
                      </Label>
                      <Select
                        value={settings.profileVisibility}
                        onValueChange={(
                          value: "public" | "friends" | "private",
                        ) => updateSetting("profileVisibility", value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">
                          Show Watch History
                        </Label>
                        <p className="text-sm text-gray-500">
                          Allow others to see what you've watched
                        </p>
                      </div>
                      <Switch
                        checked={settings.showWatchHistory}
                        onCheckedChange={(checked) =>
                          updateSetting("showWatchHistory", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">Data Collection</Label>
                        <p className="text-sm text-gray-500">
                          Help improve FlickPick with usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={settings.dataCollection}
                        onCheckedChange={(checked) =>
                          updateSetting("dataCollection", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Playback Settings */}
            <TabsContent value="playback" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white">
                    Playback Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your video viewing experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">Autoplay</Label>
                        <p className="text-sm text-gray-500">
                          Automatically play next episode
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoplay}
                        onCheckedChange={(checked) =>
                          updateSetting("autoplay", checked)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Video Quality</Label>
                        <Select
                          value={settings.videoQuality}
                          onValueChange={(value) =>
                            updateSetting("videoQuality", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="480p">480p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="4k">4K</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">
                          Subtitle Language
                        </Label>
                        <Select
                          value={settings.subtitleLanguage}
                          onValueChange={(value) =>
                            updateSetting("subtitleLanguage", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">
                          Enable Subtitles
                        </Label>
                        <p className="text-sm text-gray-500">
                          Show subtitles by default
                        </p>
                      </div>
                      <Switch
                        checked={settings.subtitlesEnabled}
                        onCheckedChange={(checked) =>
                          updateSetting("subtitlesEnabled", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Settings */}
            <TabsContent value="accessibility" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-white">
                    Accessibility Options
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Make FlickPick more accessible for your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">High Contrast</Label>
                        <p className="text-sm text-gray-500">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) =>
                          updateSetting("highContrast", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">Large Text</Label>
                        <p className="text-sm text-gray-500">
                          Increase text size throughout the app
                        </p>
                      </div>
                      <Switch
                        checked={settings.largeText}
                        onCheckedChange={(checked) =>
                          updateSetting("largeText", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">Reduced Motion</Label>
                        <p className="text-sm text-gray-500">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <Switch
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) =>
                          updateSetting("reducedMotion", checked)
                        }
                      />
                    </div>
                  </div>

                  <Alert className="border-blue-500 bg-blue-500/10">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-blue-400">
                      These settings will take effect immediately. Some changes
                      may require refreshing the page.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
