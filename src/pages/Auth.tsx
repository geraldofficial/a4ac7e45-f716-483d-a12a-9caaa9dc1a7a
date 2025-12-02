import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedLoginForm } from "@/components/auth/EnhancedLoginForm";
import { EnhancedSignupForm } from "@/components/auth/EnhancedSignupForm";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !window.location.hash.includes("access_token")) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // If user is logged in, show logout option instead
  if (user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-md w-full p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.full_name || user.email}!
            </h1>
            <p className="text-gray-400">
              You're already logged in to FlickPick
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>

            <Button
              onClick={signOut}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return isLogin ? (
    <EnhancedLoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <EnhancedSignupForm onToggleMode={() => setIsLogin(true)} />
  );
};

export default Auth;
