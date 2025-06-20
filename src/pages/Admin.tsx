import React from "react";
import { CloudscapeAdminDashboard } from "@/components/admin/CloudscapeAdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <img
            src="/logo.svg"
            alt="FlickPick"
            className="h-12 w-auto mx-auto mb-4 animate-pulse"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <CloudscapeAdminDashboard />;
};

export default Admin;
