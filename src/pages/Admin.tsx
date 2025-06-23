import React, { useState, useEffect } from "react";
import AdminAuth from "@/components/admin/AdminAuth";
import PerfectAdminDashboard from "@/components/admin/PerfectAdminDashboard";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = sessionStorage.getItem("admin_authenticated");
      const sessionStart = sessionStorage.getItem("admin_session_start");

      if (authStatus === "true" && sessionStart) {
        const startTime = parseInt(sessionStart);
        const currentTime = Date.now();
        const sessionDuration = currentTime - startTime;

        // Session expires after 8 hours (8 * 60 * 60 * 1000 = 28800000 ms)
        if (sessionDuration < 28800000) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          sessionStorage.removeItem("admin_authenticated");
          sessionStorage.removeItem("admin_session_start");
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_session_start");
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return <PerfectAdminDashboard onSignOut={handleSignOut} />;
};

export default Admin;
