import React from "react";

// Maintenance Page Display
// const App = () => {
//   return (
//     <div style={{ 
//       height: "100vh", 
//       width: "100vw", 
//       display: "flex", 
//       justifyContent: "center", 
//       alignItems: "center", 
//       backgroundColor: "#f8f9fa"
//     }}>
//       <img 
//         src="https://www.shutterstock.com/image-vector/website-under-construction-page-web-260nw-2014660451.jpg" 
//         alt="Under Maintenance" 
//         style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
//       />
//     </div>
//   );
// };

// export default App;


import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import CodeVerificationAuthPage from "./pages/auth/CodeVerificationPage";
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
        <Route path="/" element={<Home />} />
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
        <Route
          path="/verify"
          element={
            <PublicRoute>
              <CodeVerificationAuthPage />
           </PublicRoute>
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
