import React, { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTimesCircle,
  FaCheckCircle,
  FaTruck,
} from "react-icons/fa";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import Loader from "./Loader";

const nebulaImg =
  "https://thumbs.dreamstime.com/b/success-banner-advertisement-concept-29237997.jpg";

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
          axios.get(
            `https://nepcart-backend.onrender.com/purchase/user/${user._id}`
          ),
          axios.get(
            `https://nepcart-backend.onrender.com/orderc/custom-orders/user/${user._id}`
          ),
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

        if (!hasActiveTimer) {
          clearInterval(interval);
        }

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
      if (!user) {
        alert("User not authenticated");
        return;
      }

      const response = await axios.post(
        "https://nepcart-backend.onrender.com/api/feedback/postf",
        {
          message: feedback,
          userName: user.userName,
          number: user.number,
        }
      );

      if (response.status === 201) {
        alert("Feedback submitted successfully");
        setFeedback("");
      } else {
        alert("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Error submitting feedback.");
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
      } else {
        alert(res.data.message || "Cancel failed ❌");
      }
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
    <div className="min-h-screen bg-white px-6 py-10 md:px-16 text-gray-800">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-orange-500 font-serif tracking-tight drop-shadow-md">
          My Profile 🥴
        </h1>
        <p className="text-blue-600 mt-1 text-sm">
          Manage your account, orders, and feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-4">
              <FaUserCircle size={64} className="text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold">
                  {loggedInUser ? loggedInUser.userName : "Loading..."}
                </h2>
                <p className="text-sm text-gray-500">
                  {loggedInUser ? loggedInUser.number : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src={nebulaImg}
              alt="Space filler"
              className="w-full h-48 object-cover rounded-xl shadow"
            />
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-orange-500 mb-4">
            Order Tracking (we will call you soon)
            <br />
            <h4>We will call you to ask for Rs.100 to confirm your order.</h4>
          </h3>
          <div className="space-y-4">
            {loadingOrders ? (
              <p className="text-center text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order, i) => {
                const timeLeft = cancelTimers[order.orderId] ?? 0;
                const canCancel = order.status !== "Cancelled" && timeLeft > 0;

                return (
                  <div
                    key={`${order.orderId}-${i}`}
                    className={`flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all ${
                      order.status === "Cancelled"
                        ? "bg-red-100 hover:bg-red-200"
                        : "bg-white hover:bg-blue-50"
                    }`}
                  >
                    <div>
                      <h4
                        className="font-semibold text-lg text-blue-600 cursor-pointer underline"
                        onClick={() => openPreview(order)}
                      >
                        {order.productId?.name || "Unnamed Product"}
                        <br />
                        <button
                          style={{
                            fontSize: "0.95rem",
                            color: "#333",
                            background: "white",
                            border: "2px solid #ff6600",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "500",
                            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#ff6600";
                            e.target.style.color = "white";
                            e.target.style.transform = "translateY(-3px)";
                            e.target.style.boxShadow =
                              "0 8px 15px rgba(255, 102, 0, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#333";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 3px 6px rgba(0,0,0,0.1)";
                          }}
                        >
                          Click to preview order
                        </button>
                        <br />
                      </h4>
                      <p className="text-sm">
                        Status:{" "}
                        <span className="font-medium">{order.status}</span>
                      </p>
                      <p className="text-sm">
                        id: <span className="font-medium">{order.orderId}</span>
                      </p>
                      {canCancel && (
                        <p className="text-sm text-gray-500">
                          Time left to cancel:{" "}
                          <span className="font-semibold">
                            {formatTime(timeLeft)}
                          </span>
                        </p>
                      )}
                      {!canCancel && order.status !== "Cancelled" && (
                        <p className="text-sm text-red-500 font-semibold">
                          Can't Cancel
                        </p>
                      )}
                    </div>
                    <div className="flex gap-4 items-center">
                      {order.status === "Cancelled" ? (
                        <FaTimesCircle className="text-red-500 text-xl" />
                      ) : order.status === "Delivered" ? (
                        <FaCheckCircle className="text-green-500 text-xl" />
                      ) : (
                        <FaTruck className="text-blue-500 text-xl" />
                      )}
                      {canCancel ? (
                        cancellingOrderId === order.orderId ? (
                          <>
                            <Loader />{" "}
                            {/* ✅ Show loader only for the specific order */}
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleCancelOrder(order.orderId, order.isCustom)
                            }
                            className="px-3 py-1 text-sm rounded-md font-semibold transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Cancel Order
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1 text-sm rounded-md font-semibold bg-gray-400 text-white cursor-not-allowed"
                        >
                          Can't Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-blue-500 mb-4">
              Top Customers
            </h3>
            {loadingTopUsers ? (
              <p>Loading top customers...</p>
            ) : topUsersError ? (
              <p className="text-red-500">{topUsersError}</p>
            ) : topUsers.length === 0 ? (
              <p>No top users data available.</p>
            ) : (
              <ul className="space-y-3">
                {topUsers.map((user, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      {user.userName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {user.purchaseProducts} items
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-blue-500 mb-4">
            Feedback & Suggestions
          </h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write your feedback here..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
          ></textarea>
          <button
            onClick={handleFeedbackSubmit}
            className="mt-3 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold shadow"
          >
            Submit Feedback
          </button>
        </div>
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">
              Product Preview
            </h2>
            {selectedProduct.productId?.url ? (
              <img
                src={selectedProduct.productId.url}
                alt={selectedProduct.productId.name}
                className="w-full h-48 object-contain mx-auto rounded mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                No Image
              </div>
            )}
            <h3 className="text-xl font-semibold mb-1">
              {selectedProduct.productId?.name || "Unnamed Product"}
            </h3>
            <p className="text-sm text-gray-700 mb-1">
              Quantity: <strong>{selectedProduct.quantity}</strong>
            </p>
            <p className="text-sm text-gray-600">
              {selectedProduct.productId?.desc || "No description available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
