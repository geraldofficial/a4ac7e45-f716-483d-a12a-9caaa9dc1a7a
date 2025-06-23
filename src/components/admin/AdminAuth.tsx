import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get admin credentials from localStorage or use defaults
      const storedAdminEmail =
        localStorage.getItem("admin_email") || "geraldnjau21@gmail.com";
      const storedAdminPassword =
        localStorage.getItem("admin_password") || "walase";

      if (email !== storedAdminEmail || password !== storedAdminPassword) {
        toast.error("Invalid admin credentials");
        return;
      }

      // Set session
      sessionStorage.setItem("admin_authenticated", "true");
      sessionStorage.setItem("admin_session_start", Date.now().toString());

      toast.success("Welcome to FlickPick Admin");
      onAuthenticated();
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-600 rounded-full w-fit">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          <p className="text-gray-400">
            Secure access to FlickPick administration
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Authenticating...
                </>
              ) : (
                "Access Admin Panel"
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
