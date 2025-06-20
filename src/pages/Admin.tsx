import React from "react";
import { AdminDashboard } from "@/components/admin/enhanced/AdminDashboard";
import { useAuthState } from "@/hooks/useAuthState";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  // Check if user is admin (you may want to add an admin role check)
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AdminDashboard />;
};

export default Admin;
