import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import ProductPreviewModal from "../../components/ProductPreviewModal";
import { getUserFromCookie } from "../../utils/getUserFromCookie";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false); // ✅ Modal toggle
  const [location, setLocation] = useState(""); // ✅ Capture location
  const [checkoutLoading, setCheckoutLoading] = useState(false); // ✅ Loading for order
  const [cmsg, setCmsg] = useState(""); 

  useEffect(() => {
    axios
      .get("https://nepcart-backend.onrender.com/api/cart", {
        withCredentials: true,
      })
      .then((res) => {
        const withQuantity = res.data.map((item) => ({
          ...item,
          quantity: 1,
        }));
        setCartItems(withQuantity);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
        alert("Please login to view cart.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleQuantity = (_id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === _id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1 || newQuantity > item.stock) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemove = async (_id) => {
    try {
      await axios.delete(
        `https://nepcart-backend.onrender.com/api/cart/remove/${_id}`,
        {
          withCredentials: true,
        }
      );

      setCartItems((prev) => prev.filter((item) => item._id !== _id));
      alert("Removed from cart ✅");
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      alert("Error removing item ❌");
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = totalItems * 100;
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);
  const grandTotal = (parseFloat(totalPrice) + shippingFee).toFixed(2);

  const handleConfirmCheckout = async () => {
    if (!location.trim()) return alert("Location is required");

    setCheckoutLoading(true);
    try {
      const user = await getUserFromCookie();
      if (!user?._id) throw new Error("User not found");

      const purchaseData = {
        productId: cartItems[0]?._id, // Use one primary product or null if you don’t need this
        userId: user._id,
        location,
        cmsg,
        totalPrice: parseFloat(grandTotal),
        products: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      const res = await axios.post(
        "https://nepcart-backend.onrender.com/purchase",
        purchaseData,
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        alert("Order sent successfully ✅");
        setShowCheckoutModal(false);
        setCartItems([]); // optional reset
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed ❌");
    } finally {
      setCheckoutLoading(false);
      window.location.reload();
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 md:px-12 py-10 relative z-0">
      <h1
        className="text-4xl font-extrabold tracking-tight text-orange-500 mb-8 text-center font-serif drop-shadow-sm"
        style={{ fontFamily: "Playfair Display" }}
      >
        Your Cart 😊
      </h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Section */}
          <div className="w-full lg:w-[65%] grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-md p-4 border hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                onClick={() => setSelectedProduct(item)}
              >
                <img
                  src={item.imageurl || item.url}
                  alt={item.name}
                  className="rounded-xl mb-3 w-full h-[240px] object-cover object-center"
                />
                <h2 className="text-base font-semibold text-blue-900">
                  {item.name}
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  {item.desc || "Product description not available."}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-500 font-bold text-base">
                    ₹{item.price}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantity(item._id, -1);
                      }}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold hover:bg-blue-200"
                    >
                      -
                    </button>
                    <span className="text-gray-700 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantity(item._id, 1);
                      }}
                      disabled={item.quantity >= item.stock}
                      className={`px-2 py-1 ${
                        item.quantity >= item.stock
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      } rounded-full font-bold`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item._id);
                  }}
                  className="mt-3 w-full text-sm text-red-500 hover:text-red-700 underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Right Section - Summary */}
          <div className="w-full lg:w-[35%] bg-gray-50 rounded-2xl shadow-lg p-6 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Custom Specification Message
              </label>
              <textarea
                value={cmsg}
                onChange={(e) => setCmsg(e.target.value)}
                placeholder="Add any special requests — for example, preferred size, color, or extra specifications (optional)"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-4 placeholder-gray-500 text-sm sm:text-base resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2 text-gray-700">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>Rs {shippingFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Grand Total:</span>
                <span>Rs {grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md transition-all text-lg font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* ✅ Product Modal */}
      {selectedProduct && (
        <ProductPreviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ✅ Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] max-w-md text-center relative">
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setShowCheckoutModal(false)}
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Confirm Checkout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to confirm this order? Your cart will be
              processed.
            </p>
            <br />
            <h4>We will call you to ask for Rs.100 to confirm your order.</h4>

            {checkoutLoading ? (
              <Loader />
            ) : (
              <button
                onClick={handleConfirmCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-lg font-semibold"
              >
                Confirm Checkout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
