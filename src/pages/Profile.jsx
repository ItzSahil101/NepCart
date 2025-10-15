import React, { useState, useEffect } from "react";
import { FaUserCircle, FaTimesCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

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
        const response = await axios.get(
          "https://nepcart-backend.onrender.com/api/product/top-users"
        );
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
          axios.get(`https://nepcart-backend.onrender.com/orderc/custom-orders/user/${user._id}`)
        ]);

        const normalOrders = res1.data.flatMap((purchase) =>
          purchase.products.map((p) => ({
            ...p,
            orderId: purchase._id,
            createdAt: purchase.createdAt,
            cancelTimeLeft: purchase.cancelTimeLeft,
            status: p.status || purchase.status || "Pending",
            isCustom: false
          }))
        );

        const customOrders = res2.data.map((order) => ({
          productId: {
            name: `Custom T-Shirt (${order.tshirtColor})`,
            url: order.imageUrl,
            desc: `Color: ${order.tshirtColor}, Location: ${order.location}`
          },
          quantity: 1,
          orderId: order._id,
          createdAt: order.createdAt,
          cancelTimeLeft: order.cancelTimeLeft,
          status: order.status || "Pending",
          isCustom: true
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

  // --- Framer Motion Variants ---
  const cardVariants = {
    hover: { scale: 1.03, rotateX: 3, rotateY: 3, boxShadow: "0px 25px 50px rgba(0,0,0,0.2)" },
  };

  const buttonVariants = {
    hover: { scale: 1.06, boxShadow: "0px 10px 25px rgba(0,0,0,0.3)" },
  };

  const glowVariants = {
    hover: { scale: 1.1, rotate: [0, 5, -5, 0], transition: { yoyo: Infinity, duration: 1 } },
  };

  return (
    <div className="min-h-screen font-poppins text-gray-800 relative bg-gradient-to-b from-orange-50 to-white overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
          My Profile <span className="text-pink-500">🥳</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl font-medium text-gray-600">
          Manage your account, orders & feedback in style ✨
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 lg:px-16">
        {/* User Card */}
        <motion.div
          className="col-span-1 flex flex-col gap-6 items-center lg:items-start"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 p-8 rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center w-full transition-all duration-300 hover:scale-105"
          >
            <motion.div className="text-blue-500 mb-5" variants={glowVariants} whileHover="hover">
              <FaUserCircle size={100} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">{loggedInUser?.userName || "Loading..."}</h2>
            <p className="text-gray-700 text-lg">{loggedInUser?.number || ""}</p>
          </motion.div>

          <motion.img
            src={nebulaImg}
            alt="Nebula Background"
            className="w-full h-60 object-cover rounded-2xl shadow-xl hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        </motion.div>

        {/* Orders */}
        <div className="col-span-2">
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              Order Tracking <span className="text-gray-500 font-medium text-base">(We’ll call you soon)</span>
            </h3>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              We will call you to confirm your order by asking for Rs.100 as advance payment 💸
            </p>

            <div className="space-y-5">
              {loadingOrders ? (
                <p className="text-center text-gray-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-center text-gray-400 font-medium">No orders found.</p>
              ) : (
                orders.map((order, i) => {
                  const timeLeft = cancelTimers[order.orderId] ?? 0;
                  const canCancel = order.status !== "Cancelled" && timeLeft > 0;

                  return (
                    <motion.div
                      key={`${order.orderId}-${i}`}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border shadow-md transition-all duration-300 ${
                        order.status === "Cancelled" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                      }`}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div className="flex-1">
                        <h4
                          className="font-semibold text-lg text-blue-600 underline cursor-pointer mb-3"
                          onClick={() => openPreview(order)}
                        >
                          {order.productId?.name || "Unnamed Product"}
                        </h4>
                        <motion.button
                          onClick={() => openPreview(order)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white font-semibold shadow-lg"
                          variants={buttonVariants}
                          whileHover="hover"
                        >
                          Preview Order
                        </motion.button>
                        <div className="mt-4 space-y-1 text-sm">
                          <p>
                            <span className="font-medium text-gray-700">Status:</span>{" "}
                            <span className="font-semibold">{order.status}</span>
                          </p>
                          <p>
                            <span className="font-medium text-gray-700">Order ID:</span>{" "}
                            <span className="font-semibold text-gray-800">{order.orderId}</span>
                          </p>
                          {canCancel && (
                            <p className="text-gray-600">
                              Time left to cancel:{" "}
                              <span className="font-semibold text-gray-900">{formatTime(timeLeft)}</span>
                            </p>
                          )}
                          {!canCancel && order.status !== "Cancelled" && (
                            <p className="text-red-500 font-semibold">Can't Cancel ❌</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        {order.status === "Cancelled" ? (
                          <FaTimesCircle className="text-red-500 text-2xl" />
                        ) : order.status === "Delivered" ? (
                          <FaCheckCircle className="text-green-500 text-2xl" />
                        ) : (
                          <FaTruck className="text-blue-500 text-2xl" />
                        )}

                        {canCancel ? (
                          cancellingOrderId === order.orderId ? (
                            <Loader />
                          ) : (
                            <motion.button
                              onClick={() => handleCancelOrder(order.orderId, order.isCustom)}
                              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-400 via-orange-500 to-yellow-400 text-white shadow-lg"
                              variants={buttonVariants}
                              whileHover="hover"
                            >
                              Cancel Order
                            </motion.button>
                          )
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-400 text-white cursor-not-allowed"
                          >
                            Can't Cancel
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 px-6 lg:px-16">
        {/* Top Customers */}
        <motion.div
          className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-xl font-bold text-blue-500 mb-5">Top Customers 🏆</h3>
          {loadingTopUsers ? (
            <p>Loading top customers...</p>
          ) : topUsersError ? (
            <p className="text-red-500">{topUsersError}</p>
          ) : topUsers.length === 0 ? (
            <p>No top users data available.</p>
          ) : (
            <ul className="space-y-3">
              {topUsers.map((user, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center ${
                    index === 0 ? "text-yellow-500 font-bold" : ""
                  }`}
                >
                  <span>{user.userName}</span>
                  <span className="text-gray-600">{user.purchaseProducts} items</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Feedback */}
        <motion.div
          className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-xl font-bold text-blue-500 mb-5">Feedback & Suggestions 💡</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback here..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
          ></textarea>
          <motion.button
            onClick={handleFeedbackSubmit}
            className="mt-5 px-6 py-3 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white rounded-xl font-semibold shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
          >
            Submit Feedback
          </motion.button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-3xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">Product Preview</h2>
              {selectedProduct.productId?.url ? (
                <img
                  src={selectedProduct.productId.url}
                  alt={selectedProduct.productId.name}
                  className="w-full h-60 object-cover rounded-2xl mb-4"
                />
              ) : (
                <p className="text-gray-500">No image available</p>
              )}
              <p className="text-gray-700">{selectedProduct.productId?.desc || "No description"}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
