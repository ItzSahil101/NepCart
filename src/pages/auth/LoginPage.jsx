import React, { useState } from "react";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../Loader";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../firebase.config";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [unverifiedNumber, setUnverifiedNumber] = useState("");

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
      if (msg.includes("verify")) {
        setUnverifiedNumber(formattedNumber);
        setShowVerifyPopup(true);
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return alert("Please enter a new password");
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters");

    setLoading(true);
    try {
      const formattedNumber = number.startsWith("+977")
        ? number
        : "+977" + number;
      const res = await axios.post(
        "https://nepcart-backend.onrender.com/api/auth/reset-password",
        {
          number: formattedNumber,
          newPassword,
        }
      );
      alert(res.data?.msg || "Password reset successful");
      setForgotOpen(false);
      setStep(1);
      setNewPassword("");
      setOtp(["", "", "", "", "", ""]); // Reset OTP inputs if you have 6 digits
    } catch (error) {
      console.error("Reset password error:", error);
      alert(error.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!number) return alert("Enter your phone number");
    let formattedNumber = number.startsWith("+977") ? number : "+977" + number;

    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          { size: "invisible" },
          auth
        );
        await window.recaptchaVerifier.render();
      } else {
        // Reset reCAPTCHA on resend
        const widgetId = window.recaptchaVerifier.widgetId;
        if (window.grecaptcha && widgetId !== undefined) {
          window.grecaptcha.reset(widgetId);
        }
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;

      alert("OTP sent via Firebase");
      setStep(2);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      alert("Failed to send OTP via Firebase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const codeStr = otp.join("");
    if (codeStr.length !== 4 && codeStr.length !== 6)
      // You may adjust based on your OTP length (Firebase usually 6)
      return alert("Enter full OTP");

    setLoading(true);
    try {
      if (!window.confirmationResult)
        throw new Error("No OTP confirmation found");

      const result = await window.confirmationResult.confirm(codeStr);

      alert("OTP verified successfully via Firebase");

      // Call backend to mark verified
      let formattedNumber = number.startsWith("+977")
        ? number
        : "+977" + number;
      await axios.post(
        "https://nepcart-backend.onrender.com/api/auth/mark-verified",
        {
          number: formattedNumber,
        }
      );

      alert("Your number is now marked as verified.");
      setStep(3);
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!unverifiedNumber) return alert("Phone number is missing");

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          { size: "invisible" },
          auth
        );
        await window.recaptchaVerifier.render();
      } else {
        const widgetId = window.recaptchaVerifier.widgetId;
        if (window.grecaptcha && widgetId !== undefined) {
          window.grecaptcha.reset(widgetId);
        }
      }
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        unverifiedNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      navigate("/verify", { state: { number: unverifiedNumber } });
      setShowVerifyPopup(false);
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Failed to send OTP via Firebase. Please try again.");
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>
      {loading && <Loader />}

      {/* OTP Re-Verification Popup */}
      {showVerifyPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowVerifyPopup(false)}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Account not verified</h2>
            <p className="text-sm text-gray-600 mb-3">
              Resend OTP to verify your number
            </p>
            <input
              type="tel"
              value={unverifiedNumber}
              onChange={(e) => setUnverifiedNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <button
              onClick={handleResendOtp}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
            >
              Send OTP
            </button>
          </div>
        </div>
      )}

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
                onClick={() => setForgotOpen(true)}
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

            {/* Forgot Password Layer */}
            {forgotOpen && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 rounded-xl z-20 flex flex-col justify-center">
                {step === 1 && (
                  <>
                    <h2 className="text-center font-bold mb-4 text-lg">
                      Reset Password
                    </h2>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="mb-4 px-4 py-2 border rounded w-full"
                    />
                    <button
                      onClick={sendOtp}
                      className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Send OTP
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-center font-bold mb-4 text-lg">
                      Enter OTP
                    </h2>
                    <div className="flex justify-between gap-2 mb-4">
                      {otp.map((val, i) => (
                        <input
                          key={i}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={val}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d?$/.test(val)) {
                              // Only digits or empty allowed
                              const copy = [...otp];
                              copy[i] = val;
                              setOtp(copy);
                              if (val && i < otp.length - 1) {
                                const nextInput = document.getElementById(
                                  `otp-${i + 1}`
                                );
                                if (nextInput) nextInput.focus();
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                              const prevInput = document.getElementById(
                                `otp-${i - 1}`
                              );
                              if (prevInput) prevInput.focus();
                            }
                          }}
                          id={`otp-${i}`}
                          className="w-12 h-12 text-center border rounded text-xl"
                        />
                      ))}
                    </div>

                    <button
                      onClick={verifyOtp}
                      className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Verify OTP
                    </button>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-center font-bold mb-4 text-lg">
                      Set New Password
                    </h2>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mb-4 px-4 py-2 border rounded w-full"
                    />
                    <button
                      onClick={resetPassword}
                      className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                    >
                      Reset Password
                    </button>
                  </>
                )}

                <button
                  className="mt-4 text-sm text-gray-500 underline"
                  onClick={() => {
                    setForgotOpen(false);
                    setStep(1);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
