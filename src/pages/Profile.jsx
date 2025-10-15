import React, { useState, useEffect } from "react";
import { FaUserCircle, FaTimesCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

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
        alert("Feedback submitted successfully 🎉");
        setFeedback("");
      } else alert("Failed to submit feedback ❌");
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Error submitting feedback ❌");
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
        alert("Order cancelled ✅");
        setOrders((prev) => prev.filter((item) => item.orderId !== id));
        window.location.reload();
      } else alert(res.data.message || "Cancel failed ❌");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Error cancelling order ❌");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const openPreview = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Apple-style Framer Motion Variants
  const cardVariants = { hover: { scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" } };
  const buttonVariants = { hover: { scale: 1.05 } };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <h1 className="text-4xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-500">Manage your account, orders & feedback</p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center"
          variants={cardVariants}
          whileHover="hover"
        >
          <FaUserCircle size={90} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900">{loggedInUser?.userName || "Loading..."}</h2>
          <p className="text-gray-500 mt-1">{loggedInUser?.number || ""}</p>
        </motion.div>

        {/* Orders */}
        <div className="lg:col-span-2 space-y-6">
          {orders.map((order, i) => {
            const timeLeft = cancelTimers[order.orderId] ?? 0;
            const canCancel = order.status !== "Cancelled" && timeLeft > 0;
            return (
              <motion.div
                key={i}
                className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{order.productId?.name}</h3>
                  <p className="text-gray-400 text-sm">Status: {order.status}</p>
                  {canCancel && <p className="text-gray-400 text-sm">Time left to cancel: {formatTime(timeLeft)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {order.status === "Cancelled" ? (
                    <FaTimesCircle className="text-red-400" />
                  ) : order.status === "Delivered" ? (
                    <FaCheckCircle className="text-green-400" />
                  ) : (
                    <FaTruck className="text-blue-400" />
                  )}
                  {canCancel && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId, order.isCustom)}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {loadingOrders && <Loader />}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-medium text-gray-900 mb-4">Top Customers</h3>
          {loadingTopUsers ? (
            <p className="text-gray-400">Loading...</p>
          ) : topUsersError ? (
            <p className="text-red-400">{topUsersError}</p>
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
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
          <h3 className="font-medium text-gray-900 mb-4">Feedback & Suggestions</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback..."
            className="border border-gray-200 rounded-lg p-3 resize-none focus:ring-1 focus:ring-gray-300 focus:outline-none text-gray-700"
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg px-4 py-2 text-sm transition"
          >
            Submit Feedback
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl font-bold"
              >
                &times;
              </button>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedProduct.productId?.name}</h3>
              {selectedProduct.productId?.url && (
                <img
                  src={selectedProduct.productId.url}
                  alt={selectedProduct.productId.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <p className="text-gray-500">{selectedProduct.productId?.desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
