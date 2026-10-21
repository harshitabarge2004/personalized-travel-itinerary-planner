// src/components/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store";

/**
 * RequireAuth component protects routes that need an authenticated user.
 * If no user is present in the global Zustand store, the user is redirected
 * to the login page, preserving the intended destination via `state`.
 */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // redirect to login, retain the original location for post‑login navigation
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export default RequireAuth;
