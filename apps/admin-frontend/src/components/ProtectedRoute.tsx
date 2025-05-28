import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded: { exp: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);

  if (!valid && token) localStorage.removeItem("token");

  return valid ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
