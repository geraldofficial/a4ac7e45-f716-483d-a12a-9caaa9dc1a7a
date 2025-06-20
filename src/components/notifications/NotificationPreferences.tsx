import React, { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Users,
  Calendar,
  Heart,
  Settings,
  Gift,
  Moon,
  Clock,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  enhancedNotificationsService,
  NotificationPreferences,
} from "@/services/enhancedNotifications";

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

const PreferenceItem = ({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: PreferenceItemProps) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-start space-x-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-white">{title}</Label>
          {badge && (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-700 text-gray-300"
            >
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      className="data-[state=checked]:bg-blue-600"
    />
  </div>
);

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (user?.id) {
      enhancedNotificationsService.setUserId(user.id);
      loadPreferences();
    }

    // Check push notification support
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await enhancedNotificationsService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const updates = {
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        watch_party_invites: preferences.watch_party_invites,
        friend_requests: preferences.friend_requests,
        new_content: preferences.new_content,
        system_updates: preferences.system_updates,
        marketing: preferences.marketing,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
      };

      const updated =
        await enhancedNotificationsService.updatePreferences(updates);
      if (updated) {
        setPreferences(updated);
        setHasChanges(false);
        toast.success("Notification preferences saved!");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => {
    if (!preferences) return;

    setPreferences((prev) => (prev ? { ...prev, [key]: value } : null));
    setHasChanges(true);
  };

  const requestPushPermission = async () => {
    if (!pushSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        updatePreference("push_notifications", true);
        await enhancedNotificationsService.requestPushPermission();
        toast.success("Push notifications enabled!");
      } else {
        updatePreference("push_notifications", false);
        toast.error("Push notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting push permission:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const testNotification = async () => {
    if (!user?.id) return;

    try {
      await enhancedNotificationsService.createNotification({
        user_id: user.id,
        title: "🧪 Test Notification",
        message:
          "This is a test notification to verify your settings are working correctly.",
        type: "info",
        priority: "medium",
        actions: [
          {
            id: "dismiss",
            label: "Dismiss",
            action: "dismiss",
            style: "secondary",
          },
        ],
      });
      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    }
  };

  const resetToDefaults = () => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      email_notifications: true,
      push_notifications: pushPermission === "granted",
      watch_party_invites: true,
      friend_requests: true,
      new_content: true,
      system_updates: true,
      marketing: false,
      quiet_hours_enabled: false,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
    });
    setHasChanges(true);
    toast.info("Preferences reset to defaults");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading preferences...</span>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-400" />
        <p className="text-gray-400">Failed to load notification preferences</p>
        <Button onClick={loadPreferences} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Notification Preferences
        </h2>
        <p className="text-gray-400">
          Customize how and when you receive notifications from FlickPick.
        </p>
      </div>

      {/* Delivery Methods */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Methods
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <PreferenceItem
            icon={<Mail className="h-4 w-4" />}
            title="Email Notifications"
            description="Receive notifications via email"
            checked={preferences.email_notifications}
            onChange={(checked) =>
              updatePreference("email_notifications", checked)
            }
          />

          <Separator className="bg-gray-700" />

          <PreferenceItem
            icon={<Bell className="h-4 w-4" />}
            title="Push Notifications"
            description={
              !pushSupported
                ? "Not supported in this browser"
                : pushPermission === "denied"
                  ? "Permission denied - check browser settings"
                  : "Show notifications in your browser"
            }
            checked={
              preferences.push_notifications && pushPermission === "granted"
            }
            onChange={(checked) => {
              if (checked && pushPermission !== "granted") {
                requestPushPermission();
              } else {
                updatePreference("push_notifications", checked);
              }
            }}
            disabled={!pushSupported || pushPermission === "denied"}
            badge={
              pushPermission === "granted"
                ? "Enabled"
                : pushPermission === "denied"
                  ? "Blocked"
                  : "Not Enabled"
            }
          />
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose what types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <PreferenceItem
            icon={<Users className="h-4 w-4" />}
            title="Friend Requests"
            description="When someone sends you a friend request"
            checked={preferences.friend_requests}
            onChange={(checked) => updatePreference("friend_requests", checked)}
          />

          <Separator className="bg-gray-700" />

          <PreferenceItem
            icon={<Calendar className="h-4 w-4" />}
            title="Watch Party Invites"
            description="When you're invited to join a watch party"
            checked={preferences.watch_party_invites}
            onChange={(checked) =>
              updatePreference("watch_party_invites", checked)
            }
          />

          <Separator className="bg-gray-700" />

          <PreferenceItem
            icon={<Heart className="h-4 w-4" />}
            title="New Content"
            description="Recommendations and newly added movies/shows"
            checked={preferences.new_content}
            onChange={(checked) => updatePreference("new_content", checked)}
          />

          <Separator className="bg-gray-700" />

          <PreferenceItem
            icon={<Settings className="h-4 w-4" />}
            title="System Updates"
            description="Important updates and announcements"
            checked={preferences.system_updates}
            onChange={(checked) => updatePreference("system_updates", checked)}
          />

          <Separator className="bg-gray-700" />

          <PreferenceItem
            icon={<Gift className="h-4 w-4" />}
            title="Promotions & Marketing"
            description="Special offers and promotional content"
            checked={preferences.marketing}
            onChange={(checked) => updatePreference("marketing", checked)}
          />
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-white">
                Enable Quiet Hours
              </Label>
              <p className="text-sm text-gray-400">
                Notifications will be paused during these hours
              </p>
            </div>
            <Switch
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) =>
                updatePreference("quiet_hours_enabled", checked)
              }
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) =>
                    updatePreference("quiet_hours_start", e.target.value)
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time
                </Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) =>
                    updatePreference("quiet_hours_end", e.target.value)
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Test & Manage</CardTitle>
          <CardDescription className="text-gray-400">
            Test your settings and manage your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testNotification}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>

            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>

            {pushSupported && pushPermission !== "granted" && (
              <Button
                onClick={requestPushPermission}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Push Notifications
              </Button>
            )}
          </div>

          {pushPermission === "granted" && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              Push notifications are enabled
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between sticky bottom-0 bg-gray-900 p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          {hasChanges ? (
            <span className="text-yellow-400">You have unsaved changes</span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>

        <Button
          onClick={savePreferences}
          disabled={!hasChanges || isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
