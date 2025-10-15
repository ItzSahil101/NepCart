import React, { useState, useEffect } from "react";
import { FaUserCircle, FaTimesCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

// Optional: nebula image for effect
const nebulaImg = "https://thumbs.dreamstime.com/b/success-banner-advertisement-concept-29237997.jpg";

const Profile = () => {
  const [feedback, setFeedback] = useState("");
  const [topUsers, setTopUsers] = useState([]);
  const [loadingTopUsers, setLoadingTopUsers] = useState(true);
  const [topUsersError, setTopUsersError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelTimers, setCancelTimers] = useState({});
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoadingTopUsers(true);
        const response = await axios.get("https://nepcart-backend.onrender.com/api/product/top-users");
        if (response.status === 200) {
          setTopUsers(response.data);
          setTopUsersError(null);
        } else {
          setTopUsersError("Failed to fetch top purchasers");
        }
      } catch (error) {
        console.error("Error fetching top purchasers:", error);
        setTopUsersError("Error fetching top purchasers");
      } finally {
        setLoadingTopUsers(false);
      }
    };

    const fetchUserAndOrders = async () => {
      try {
        setLoadingOrders(true);
        const user = await getUserFromCookie();
        if (!user) return;
        setLoggedInUser(user);

        const [res1, res2] = await Promise.all([
          axios.get(`https://nepcart-backend.onrender.com/purchase/user/${user._id}`),
          axios.get(`https://nepcart-backend.onrender.com/orderc/custom-orders/user/${user._id}`),
        ]);

        const normalOrders = res1.data.flatMap((purchase) =>
          purchase.products.map((p) => ({
            ...p,
            orderId: purchase._id,
            createdAt: purchase.createdAt,
            cancelTimeLeft: purchase.cancelTimeLeft,
            status: p.status || purchase.status || "Pending",
            isCustom: false,
          }))
        );

        const customOrders = res2.data.map((order) => ({
          productId: {
            name: `Custom T-Shirt (${order.tshirtColor})`,
            url: order.imageUrl,
            desc: `Color: ${order.tshirtColor}, Location: ${order.location}`,
          },
          quantity: 1,
          orderId: order._id,
          createdAt: order.createdAt,
          cancelTimeLeft: order.cancelTimeLeft,
          status: order.status || "Pending",
          isCustom: true,
        }));

        setOrders([...normalOrders, ...customOrders]);
      } catch (err) {
        console.error("Error fetching user or orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserAndOrders();
    fetchTopUsers();
  }, []);

  useEffect(() => {
    const initializeTimers = () => {
      const now = Date.now();
      const timers = {};
      orders.forEach((order) => {
        if (!order.createdAt || !order.cancelTimeLeft) return;
        const createdAtMs = new Date(order.createdAt).getTime();
        const elapsedSeconds = (now - createdAtMs) / 1000;
        const timeLeft = order.cancelTimeLeft - elapsedSeconds;
        timers[order.orderId] = timeLeft > 0 ? Math.floor(timeLeft) : 0;
      });
      setCancelTimers(timers);
    };
    initializeTimers();
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCancelTimers((prevTimers) => {
        const updatedTimers = {};
        let hasActiveTimer = false;
        for (const [orderId, secondsLeft] of Object.entries(prevTimers)) {
          if (secondsLeft > 0) {
            updatedTimers[orderId] = secondsLeft - 1;
            hasActiveTimer = true;
          } else {
            updatedTimers[orderId] = 0;
          }
        }
        if (!hasActiveTimer) clearInterval(interval);
        return updatedTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return alert("Please write something.");
    try {
      const user = await getUserFromCookie();
      if (!user) return alert("User not authenticated");
      const response = await axios.post(
        "https://nepcart-backend.onrender.com/api/feedback/postf",
        { message: feedback, userName: user.userName, number: user.number }
      );
      if (response.status === 201) {
        alert("Feedback submitted successfully!");
        setFeedback("");
      } else alert("Failed to submit feedback");
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Error submitting feedback");
    }
  };

  const handleCancelOrder = async (id, isCustom) => {
    const confirmCancel = window.confirm("Are you sure to cancel this order?");
    if (!confirmCancel) return;
    try {
      setCancellingOrderId(id);
      const url = isCustom
        ? `https://nepcart-backend.onrender.com/orderc/${id}/cancel`
        : `https://nepcart-backend.onrender.com/purchase/${id}/cancel`;
      const res = await axios.put(url);
      if (res.status === 200) {
        alert("Order cancelled!");
        setOrders((prev) => prev.filter((item) => item.orderId !== id));
        window.location.reload();
      } else alert(res.data.message || "Cancel failed");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Error cancelling order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const openPreview = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div
      className="min-h-screen font-sans text-gray-800"
      style={{ backgroundColor: "rgba(255,255,255,0.75)", paddingBottom: "4rem" }}
    >
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">My Profile 🎉</h1>
        <p className="text-gray-600 text-lg">Manage your account, orders, and feedback</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Card */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg flex flex-col items-center w-full">
            <FaUserCircle size={90} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">{loggedInUser?.userName || "Loading..."}</h2>
            <p className="text-gray-700">{loggedInUser?.number || ""}</p>
          </div>
          <img
            src={nebulaImg}
            alt="Nebula"
            className="w-full h-56 object-cover rounded-2xl shadow-md hidden lg:block"
          />
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 space-y-6">
          {orders.length === 0 && !loadingOrders && <p className="text-gray-500">No orders found.</p>}
          {loadingOrders && <Loader />}
          {orders.map((order, i) => {
            const timeLeft = cancelTimers[order.orderId] ?? 0;
            const canCancel = order.status !== "Cancelled" && timeLeft > 0;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow p-5 flex justify-between items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{order.productId?.name}</h3>
                  <p className="text-gray-500 text-sm">Status: {order.status}</p>
                  {canCancel && <p className="text-gray-500 text-sm">Time left: {formatTime(timeLeft)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {order.status === "Cancelled" ? (
                    <FaTimesCircle className="text-red-500 text-2xl" />
                  ) : order.status === "Delivered" ? (
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  ) : (
                    <FaTruck className="text-blue-500 text-2xl" />
                  )}
                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId, order.isCustom)}
                      className="px-3 py-1 bg-red-400 text-white rounded-lg text-sm hover:bg-red-500 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Customers */}
        <div className="bg-white p-6 rounded-3xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Customers 🏆</h3>
          {loadingTopUsers ? (
            <p className="text-gray-500">Loading top customers...</p>
          ) : topUsersError ? (
            <p className="text-red-500">{topUsersError}</p>
          ) : (
            <ul className="space-y-2">
              {topUsers.map((user, index) => (
                <li key={index} className="flex justify-between text-gray-700">
                  <span>{user.userName}</span>
                  <span>{user.purchaseProducts} items</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Feedback */}
        <div className="bg-white p-6 rounded-3xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback & Suggestions 💡</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback here..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:outline-none"
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
