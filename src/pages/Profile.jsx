import React, { useState, useEffect } from "react";
import { FaUserCircle, FaTimesCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

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

  // Fetch Top Users & Orders
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
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserAndOrders();
    fetchTopUsers();
  }, []);

  // Cancel Timer Logic
  useEffect(() => {
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
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCancelTimers((prev) => {
        const updated = {};
        let active = false;
        for (const [id, sec] of Object.entries(prev)) {
          updated[id] = sec > 0 ? sec - 1 : 0;
          if (sec > 0) active = true;
        }
        if (!active) clearInterval(interval);
        return updated;
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
      const res = await axios.post(
        "https://nepcart-backend.onrender.com/api/feedback/postf",
        { message: feedback, userName: user.userName, number: user.number }
      );
      if (res.status === 201) {
        alert("Feedback submitted successfully");
        setFeedback("");
      } else alert("Failed to submit feedback");
    } catch (error) {
      alert("Error submitting feedback.");
    }
  };

  const handleCancelOrder = async (id, isCustom) => {
    if (!window.confirm("Are you sure to cancel this order?")) return;
    try {
      setCancellingOrderId(id);
      const url = isCustom
        ? `https://nepcart-backend.onrender.com/orderc/${id}/cancel`
        : `https://nepcart-backend.onrender.com/purchase/${id}/cancel`;
      const res = await axios.put(url);
      if (res.status === 200) {
        setOrders((prev) => prev.filter((o) => o.orderId !== id));
        alert("Order cancelled ✅");
      } else alert(res.data.message || "Cancel failed ❌");
    } catch (err) {
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-orange-50 px-6 md:px-16 py-10 text-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-orange-500 drop-shadow-lg font-serif tracking-tight">
          My Profile
        </h1>
        <p className="text-blue-600 mt-2 text-lg md:text-xl">
          Manage your account, orders, and feedback
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-1 flex flex-col gap-6"
        >
          <div className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center gap-4">
              <FaUserCircle size={72} className="text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold">
                  {loggedInUser ? loggedInUser.userName : "Loading..."}
                </h2>
                <p className="text-gray-500 text-sm">
                  {loggedInUser ? loggedInUser.number : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block overflow-hidden rounded-2xl shadow-lg">
            <motion.img
              src={nebulaImg}
              alt="Space"
              className="w-full h-56 object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Orders Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-orange-500 mb-2">
            Order Tracking
            <span className="text-gray-500 text-base font-normal ml-2">
              (We’ll call you soon)
            </span>
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            We will call you to confirm your order by asking for Rs.100 as an advance payment.
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                      order.status === "Cancelled"
                        ? "bg-red-50 hover:bg-red-100 border-red-200"
                        : "bg-gray-50 hover:bg-blue-50 border-gray-200"
                    }`}
                  >
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-lg text-blue-600 underline cursor-pointer mb-2"
                        onClick={() => openPreview(order)}
                      >
                        {order.productId?.name || "Unnamed Product"}
                      </h4>

                      <button
                        onClick={() => openPreview(order)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300"
                      >
                        Preview
                      </button>

                      <div className="mt-3 space-y-1 text-sm">
                        <p>
                          <span className="font-medium text-gray-700">Status:</span>{" "}
                          <span className="font-semibold">{order.status}</span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Order ID:</span>{" "}
                          <span className="font-semibold">{order.orderId}</span>
                        </p>
                        {canCancel && (
                          <p className="text-gray-600">
                            Time left to cancel:{" "}
                            <span className="font-semibold text-gray-900">{formatTime(timeLeft)}</span>
                          </p>
                        )}
                        {!canCancel && order.status !== "Cancelled" && (
                          <p className="text-red-500 font-semibold">Can't Cancel</p>
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
                          <button
                            onClick={() => handleCancelOrder(order.orderId, order.isCustom)}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Cancel
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-400 text-white cursor-not-allowed"
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

      {/* Bottom Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-blue-500 mb-4">Top Customers</h3>
          {loadingTopUsers ? (
            <p>Loading top customers...</p>
          ) : topUsersError ? (
            <p className="text-red-500">{topUsersError}</p>
          ) : topUsers.length === 0 ? (
            <p>No top users data available.</p>
          ) : (
            <ul className="space-y-3">
              {topUsers.map((user, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="font-medium text-gray-800">{user.userName}</span>
                  <span className="text-sm text-gray-600">{user.purchaseProducts} items</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-blue-500 mb-4">Feedback & Suggestions</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback here..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all duration-200"
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="mt-3 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300"
          >
            Submit Feedback
          </button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ y: -50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -50, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">Product Preview</h2>
              {selectedProduct.productId?.url ? (
                <img
                  src={selectedProduct.productId.url}
                  alt={selectedProduct.productId.name}
                  className="w-full h-56 object-contain mx-auto rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center rounded-xl mb-4">
                  No Image
                </div>
              )}
              <h3 className="text-xl font-semibold mb-1">
                {selectedProduct.productId?.name || "Unnamed Product"}
              </h3>
              <p className="text-sm text-gray-700 mb-1">
                Quantity: <strong>{selectedProduct.quantity}</strong>
              </p>
              <p className="text-sm text-gray-600">{selectedProduct.productId?.desc || "No description available."}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
