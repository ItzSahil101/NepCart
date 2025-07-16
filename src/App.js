import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import CodeVerificationPage from "./pages/auth/CodeVerificationPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import Profile from "./pages/Profile";
import CategoryProducts from "./components/CategoryProduct";
import CartPage from "./pages/auth/CartPage";

import ProtectedRoute from "./utils/protectedRoute";
import PublicRoute from "./utils/publicRoute";
import SearchPage from "./components/Searchpage";
import CustomProducts from "./components/CustomProduct";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Route (No login required) */}
        <Route path="/" element={<Home />} />

        {/* Public-only routes (accessible only when NOT logged in) */}
        <Route
          path="/log"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/sign"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes (Login required) */}
        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <CodeVerificationPage />
            </ProtectedRoute>
          }
        />
          <Route
          path="/category"
          element={
            <ProtectedRoute>
              <CategoryProducts />
            </ProtectedRoute>
          }
        />
          <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
             path="/custom"
             element={
                <ProtectedRoute>
                   <CustomProducts />
                </ProtectedRoute>
             }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
