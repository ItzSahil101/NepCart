// BuyNowModal.jsx
import React, { useState } from "react";
import Loader from "../pages/Loader";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import axios from "axios";

export default function BuyNowModal({ product, quantity = 1, onClose }) {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [cmsg, setCmsg] = useState("");

  const handlePlaceOrder = async () => {
    if (!location.trim()) return alert("Please enter delivery location.");

    try {
      setLoading(true);
      const user = await getUserFromCookie();
      if (!user?._id) throw new Error("User not authenticated");

      const purchaseData = {
        productId: product._id, // optional, like in cart
        userId: user._id,
        location,
        cmsg,
        totalPrice: parseFloat(product.price) * quantity,
        products: [
          {
            productId: product._id,
            quantity,
          },
        ],
      };

      const res = await axios.post("https://nepcart-backend.onrender.com/purchase", purchaseData, {
        withCredentials: true,
      });

      if (res.status === 201) {
        alert("Order placed successfully ✅");
        onClose();
        window.location.reload(); // Optional: refresh to update UI
      }
    } catch (err) {
      console.error("Place Order Error:", err);
      alert("Failed to place order ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-600"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-3">Confirm Purchase</h2>
        <h4>We will call you to ask for Rs.100 to confirm your order.</h4>
        <p className="text-sm text-gray-700 mb-1">Product: {product.name}</p>
        <p className="text-sm text-gray-700 mb-4">
          Price: ₹{product.price} × {quantity} = ₹{product.price * quantity}
        </p>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your delivery location"
          className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
        />
        <br />
        <input
        type="text"
        value={cmsg}
        onChange={(e) => setCmsg(e.target.value)}
        placeholder="Any additional message like what else specification you want in product like size, color etc.. (optional)"
        className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
      />

        {loading ? (
          <Loader />
        ) : (
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-sm font-medium"
          >
            Place Order
          </button>
        )}
      </div>
    </div>
  );
}
