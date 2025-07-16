// components/PublicRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserFromCookie } from "../utils/getUserFromCookie";

const PublicRoute = ({ children }) => {
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

  if (loading) return null;

  return userExists ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
