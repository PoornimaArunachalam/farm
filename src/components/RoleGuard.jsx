import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RoleGuard({ allowedRoles = [] }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // If farmer tries to access company page or vice-versa, redirect to their own dashboard
    if (role === "farmer") return <Navigate to="/farmer/dashboard" replace />;
    if (role === "company") return <Navigate to="/company/dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
