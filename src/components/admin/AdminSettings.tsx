import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Key,
  Database,
  Save,
  Eye,
  EyeOff,
  TestTube,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const AdminSettings: React.FC = () => {
  // Admin credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // TMDB settings
  const [tmdbApiKey, setTmdbApiKey] = useState("");
  const [currentTmdbKey, setCurrentTmdbKey] = useState("");

  // UI states
  const [showPasswords, setShowPasswords] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = () => {
    // Load current admin email
    const storedEmail =
      localStorage.getItem("admin_email") || "geraldnjau21@gmail.com";
    setAdminEmail(storedEmail);

    // Load current TMDB API key (masked)
    const storedTmdbKey = localStorage.getItem("tmdb_api_key") || "";
    setCurrentTmdbKey(storedTmdbKey);
    if (storedTmdbKey) {
      setTmdbApiKey(
        storedTmdbKey.substring(0, 8) + "..." + storedTmdbKey.slice(-4),
      );
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Verify current password
    const storedPassword = localStorage.getItem("admin_password") || "walase";
    if (currentPassword !== storedPassword) {
      toast.error("Current password is incorrect");
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem("admin_password", newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Admin password updated successfully");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const testTmdbApi = async () => {
    if (!tmdbApiKey || tmdbApiKey.includes("...")) {
      toast.error("Please enter a valid TMDB API key");
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?page=1`,
        {
          headers: {
            Authorization: `Bearer ${tmdbApiKey}`,
            "Content-Type": "application/json;charset=utf-8",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `TMDB API is working! Found ${data.results?.length || 0} movies`,
        );
      } else {
        toast.error("TMDB API key is invalid or expired");
      }
    } catch (error) {
      toast.error("Failed to test TMDB API - check your internet connection");
    } finally {
      setTesting(false);
    }
  };

  const handleTmdbKeyUpdate = async () => {
    if (!tmdbApiKey || tmdbApiKey.includes("...")) {
      toast.error("Please enter a valid TMDB API key");
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem("tmdb_api_key", tmdbApiKey);

      // Update the TMDB service dynamically
      if (window.location.reload) {
        toast.success("TMDB API key updated! Refreshing to apply changes...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.success("TMDB API key updated successfully");
      }

      loadCurrentSettings();
    } catch (error) {
      toast.error("Failed to update TMDB API key");
    } finally {
      setSaving(false);
    }
  };

  const clearAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all stored admin settings? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_password");
      localStorage.removeItem("tmdb_api_key");
      sessionStorage.clear();

      toast.success("All admin data cleared");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Admin Settings</h2>
        <p className="text-gray-400">
          Manage admin credentials and system configuration
        </p>
      </div>

      {/* Admin Credentials */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Admin Email</Label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="admin@flickpick.com"
            />
            <p className="text-xs text-gray-400">
              Current:{" "}
              {localStorage.getItem("admin_email") || "geraldnjau21@gmail.com"}
            </p>
          </div>

          <Separator className="bg-gray-700" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Confirm Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="border-gray-700 text-gray-300"
            >
              {showPasswords ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Passwords
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Passwords
                </>
              )}
            </Button>

            <Button
              onClick={handlePasswordChange}
              disabled={
                saving || !currentPassword || !newPassword || !confirmPassword
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TMDB API Settings */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="h-5 w-5 mr-2" />
            TMDB API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">
              TMDB API Key (Read Access Token)
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={tmdbApiKey}
                onChange={(e) => setTmdbApiKey(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white pr-20"
                placeholder="Enter TMDB Read Access Token"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {currentTmdbKey && (
              <p className="text-xs text-gray-400">
                Current key: {currentTmdbKey.substring(0, 8)}...
                {currentTmdbKey.slice(-4)}
              </p>
            )}
            <p className="text-xs text-yellow-400">
              Get your API key from: https://www.themoviedb.org/settings/api
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={testTmdbApi}
              disabled={testing || !tmdbApiKey || tmdbApiKey.includes("...")}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test API Key
                </>
              )}
            </Button>

            <Button
              onClick={handleTmdbKeyUpdate}
              disabled={saving || !tmdbApiKey || tmdbApiKey.includes("...")}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update API Key
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-950 border border-red-800 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Clear All Settings</h4>
              <p className="text-red-400 text-sm">
                This will reset all admin settings to defaults and log you out
              </p>
            </div>
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
