import React, { useState } from "react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../Loader";
import { auth } from "../../firebase.config";

export default function CodeVerificationAuthPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const number = location.state?.number;

  const handleKeypadClick = (key) => {
    if (key === "⌫") {
      setCode((prev) => prev.slice(0, -1));
    } else if (code.length < 4) {
      setCode((prev) => prev + key);
    }
  };

  const handleSubmit = async () => {
  if (code.length !== 6) {
    alert("Enter a valid 6-digit OTP");
    return;
  }

  setLoading(true);

  try {
    if (!window.confirmationResult) throw new Error("No OTP confirmation found");

    const result = await window.confirmationResult.confirm(code);
    const user = result.user;

    // ✅ Proceed to create user in backend now
    const formData = JSON.parse(localStorage.getItem("signupData"));
    await axios.post("https://nepcart-backend.onrender.com/api/users/signup", formData);

    // ✅ Mark user as verified
    await axios.post("https://nepcart-backend.onrender.com/api/auth/mark-verified", {
      number: formData.number,
    });

    alert("Phone verified and user created successfully");
    localStorage.removeItem("signupData");
    navigate("/log");

  } catch (err) {
    console.error("OTP verification failed:", err);
    alert("Invalid OTP. Please try again.");
    setCode("");
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      {loading && <Loader />}
      <div className="min-h-[calc(100vh-64px)] w-full relative overflow-hidden bg-[hsl(218,41%,15%)] bg-[radial-gradient(circle_at_0%_0%,hsl(218,41%,35%)_15%,hsl(218,41%,30%)_35%,hsl(218,41%,20%)_75%,hsl(218,41%,19%)_80%,transparent_100%),radial-gradient(circle_at_100%_100%,hsl(218,41%,45%)_15%,hsl(218,41%,30%)_35%,hsl(218,41%,20%)_75%,hsl(218,41%,19%)_80%,transparent_100%)] p-6">
        {/* Background Decorations */}
        <div className="absolute top-[-60px] left-[-130px] w-[220px] h-[220px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-110px] w-[300px] h-[300px] bg-[radial-gradient(#44006b,#ad1fff)] rounded-[38%_62%_63%_37%/70%_33%_67%_30%] z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full overflow-hidden">
          {/* Left Side */}
          <div className="w-full md:w-1/2 text-white px-6 mb-10 md:mb-0 overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-sans">
              The best Ecommerce <br />
              <span className="text-[hsl(218,81%,75%)]">platform !!</span>
            </h1>
            <p className="text-[hsl(218,81%,85%)] text-sm">
              One of the best ecommerce platform where you can buy custom
              printed tshirts and also{" "}
              <code>You can upload any photo and print it in tshirt</code> in
              affordable price!! Fast and secured delivery with order tracking
              and easy communication between customer and seller. Delivery all
              over province 1.
            </p>
          </div>

          {/* Right Side - Verification Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <div className="w-full h-[25vh] overflow-hidden rounded-lg mb-6">
              <img
                src="/assets/images/main.jpg"
                alt="storefront"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Back Arrow */}
            <Link to="/sign" className="absolute top-4 left-4 z-50">
              <div className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-md">
                <ArrowLeftIcon className="w-5 h-5" />
              </div>
            </Link>

            {/* Arrow Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                <ArrowRightIcon className="text-white w-6 h-6" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-center text-xl font-bold font-sans text-gray-800 mb-1">
              Code Verification
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Enter verification code here
            </p>

            {/* Code Boxes */}
            <div className="flex justify-center gap-3 mb-6">
              {Array(6)
                .fill("")
                .map((_, i) => (
                  <div key={i} className={`w-12 h-12 ...`}>
                    {code[i] || ""}
                  </div>
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto mb-4">
              {[..."1234567890⌫"].map((key, i) => (
                <button
                  key={i}
                  onClick={() => handleKeypadClick(key)}
                  className="bg-gray-100 py-3 rounded-lg text-lg shadow-sm active:scale-95 transition"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Enter Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full bg-orange-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
