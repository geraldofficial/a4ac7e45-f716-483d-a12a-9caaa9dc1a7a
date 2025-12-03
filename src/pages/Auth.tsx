import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedLoginForm } from "@/components/auth/EnhancedLoginForm";
import { EnhancedSignupForm } from "@/components/auth/EnhancedSignupForm";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Give auth state time to settle
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isChecking && !loading && user && !window.location.hash.includes("access_token")) {
      navigate("/", { replace: true });
    }
  }, [user, loading, isChecking, navigate]);

  // Show loading while checking auth state
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show logout option
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome, {user.full_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground text-sm">You're already signed in</p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>

            <Button onClick={signOut} variant="outline" className="w-full" size="lg">
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
