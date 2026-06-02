import React, { useState } from "react";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../Loader";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!number || !password) return alert("Enter both phone & password");
    let formattedNumber = number.startsWith("+977") ? number : "+977" + number;

    setLoading(true);
    try {
      const res = await axios.post(
        "https://nepcart-backend.onrender.com/api/auth/login",
        { number: formattedNumber, password },
        { withCredentials: true }
      );
      alert(res.data?.msg || "Login successful");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.msg || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Under maintenance");
  };

  return (
    <>
      {loading && <Loader />}

      <div className="min-h-[calc(100vh-64px)] w-full bg-[hsl(218,41%,15%)] p-6 relative overflow-hidden">
        <div className="absolute top-[-60px] left-[-130px] w-[220px] h-[220px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-full z-0" />
        <div className="absolute bottom-[-60px] right-[-110px] w-[300px] h-[300px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-[38%_62%_63%_37%/70%_33%_67%_30%] z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full">
          <div className="w-full md:w-1/2 text-white px-6 mb-10 md:mb-0">
            <h1 className="text-4xl font-bold mb-6 font-sans">
              The best Ecommerce <br />
              <span className="text-[hsl(218,81%,75%)]">platform !!</span>
            </h1>
            <p className="text-[hsl(218,81%,85%)] text-sm">
              Buy custom printed tshirts. Upload your photo and get it printed
              affordably.
            </p>
          </div>

          <div className="bg-white/90 rounded-xl w-full max-w-md p-6 relative">
            <img
              src="/assets/images/main.jpg"
              className="w-full h-[25vh] object-cover rounded-lg mb-6"
            />
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
                <ArrowRightIcon className="text-white w-6 h-6" />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-gray-800 mb-8">
              Sign in
            </h2>

            <div className="space-y-5">
              <input
                type="tel"
                placeholder="Phone Number (Nepali only)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="mt-8 w-full bg-orange-500 text-white py-3 rounded-lg"
            >
              Login
            </button>

            <div className="text-center mt-4">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex justify-center text-xs mt-6 gap-4">
              <Link
                to="/log"
                className="text-orange-500 font-semibold hover:underline"
              >
                Sign in
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/sign"
                className="text-gray-800 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
