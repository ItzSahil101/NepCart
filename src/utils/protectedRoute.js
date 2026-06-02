// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserFromCookie } from "../utils/getUserFromCookie";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserFromCookie();
      setUserExists(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null; // You can show a loader here

  return userExists ? children : <Navigate to="/log" replace />;
};

export default ProtectedRoute;
