// src/pages/auth/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../../components/AlertBox";
import axios from "axios";
import Loader from "../Loader";
import { auth, RecaptchaVerifier } from "../../firebase.config";
import { signInWithPhoneNumber } from "firebase/auth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
     const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    number: "",
    password: "",
    location: ""
  });

    const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
  e.preventDefault();

  let { userName, number, password, location } = form;

  if (!userName || !number || !password) {
    alert("Please fill in all required fields");
    return;
  }

  if (number.length !== 10) {
    alert("Please enter a valid 10-digit Nepali number");
    return;
  }

  // Add +977 prefix if not present
  if (!number.startsWith("+977")) {
    number = "+977" + number;
  }

  setLoading(true);

  try {
    // Send corrected number in form
    await axios.post("https://nepcart-backend.onrender.com/api/users/signup", {
      userName,
      number,
      password,
      location,
    });
    alert("Signup successful! Please login.");
    navigate("/log");
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    alert("Signup failed. " + (error.response?.data?.msg || "Please try again."));
  } finally {
    setLoading(false);
  }
};



  return (
    <>
    <div id="recaptcha-container"></div> {/* Required for invisible reCAPTCHA */}
     {loading && <Loader />}
    <div className="min-h-[calc(100vh-64px)] w-full relative overflow-hidden bg-[hsl(218,41%,15%)] bg-[radial-gradient(circle_at_0%_0%,hsl(218,41%,35%)_15%,hsl(218,41%,30%)_35%,hsl(218,41%,20%)_75%,hsl(218,41%,19%)_80%,transparent_100%),radial-gradient(circle_at_100%_100%,hsl(218,41%,45%)_15%,hsl(218,41%,30%)_35%,hsl(218,41%,20%)_75%,hsl(218,41%,19%)_80%,transparent_100%)] p-6">
      
      {/* Background Shapes */}
      <div className="absolute top-[-60px] left-[-130px] w-[220px] h-[220px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-110px] w-[300px] h-[300px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-[38%_62%_63%_37%/70%_33%_67%_30%] z-0 pointer-events-none" />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full overflow-hidden">
        
        {/* Left Section */}
        <div className="w-full md:w-1/2 text-white px-6 mb-10 md:mb-0 overflow-hidden">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-sans">
            The best Ecommerce <br />
            <span className="text-[hsl(218,81%,75%)]">platform !!</span>
          </h1>
          <p className="text-[hsl(218,81%,85%)] text-sm">
            One of the best ecommerce platform where you can buy custom printed tshirts and also <code>You can 
                upload any photo and print it in tshirt</code> in affordable price!! Fast and secured delivery with 
                order tracking and easy communication between customer and seller. Delivery all over province 1.
          </p>
        </div>

        {/* Right Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md p-6 relative"
        >
          {/* Image */}
          <div className="w-full h-[25vh] overflow-hidden rounded-lg mb-6">
            <img
              src="/assets/images/main.jpg"
              alt="storefront"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Arrow Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
              <ArrowRightIcon className="text-white w-6 h-6" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-bold font-sans text-gray-800 mb-8">
            Sign up
          </h2>

          {/* Input Fields */}
          <div className="space-y-5">
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm placeholder-gray-400 text-sm"
            />

            <input
              type="tel"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="Phone Number (Nepali only)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm placeholder-gray-400 text-sm"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm placeholder-gray-400 text-sm pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location (Optional)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm placeholder-gray-400 text-sm"
            />
          </div>

          {/* Bottom Links */}
          <div className="flex justify-center text-xs mt-6 gap-4">
            <Link
              to="/log"
              className="text-gray-800 font-semibold text-sm hover:underline"
            >
              Sign in
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/sign"
              className="text-orange-500 font-semibold text-sm hover:underline"
            >
              Sign up
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-6 w-full bg-orange-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
     </>
  );
}
