import { StarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import Loader from "../pages/Loader";
import BuyNowModal from "./BuyModal";

export default function ProductPreviewModal({ product, onClose }) {
  const [loading, setLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false); // ✅ Modal trigger

  if (!product) return null;

  const handleAddToCart = async () => {
    const user = await getUserFromCookie();
    if (!user) return alert("Please log in first!");

    try {
      setLoading(true);
      const res = await axios.post(
        "https://nepcart-backend.onrender.com/api/cart/add",
        { productId: product._id },
        { withCredentials: true }
      );
      alert(res.data.message || "Added to cart ✅");
    } catch (err) {
      console.error(err);
      alert("Error adding to cart ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    setShowBuyModal(true); // ✅ Show modal
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex flex-col sm:flex-row gap-6">
            <img
              src={product.imageurl || product.url}
              alt={product.name}
              className="w-full sm:w-[200px] h-[200px] object-contain rounded"
            />

            <div className="flex flex-col flex-1">
              <h2 className="text-lg font-bold mb-2">{product.name}</h2>
              <p className="text-sm text-gray-500 mb-2">
                {product.desc || "No description available"}
              </p>
              <p className="text-sm mb-2 text-orange-600 font-bold">
                ₹{product.price}
              </p>
              <p className="text-xs text-green-600 mb-2">
                {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
              </p>

              {product.rating && (
                <div className="flex mb-2">
                  {[...Array(product.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                <button
                  disabled={loading}
                  onClick={handleAddToCart}
                  className={`flex-1 text-white text-sm py-2 rounded transition-all flex justify-center items-center ${
                    loading
                      ? "bg-blue-300 cursor-wait"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 text-white text-sm py-2 rounded transition-all flex justify-center items-center bg-orange-500 hover:bg-orange-600"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modal appears on top */}
      {showBuyModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </>
  );
}
