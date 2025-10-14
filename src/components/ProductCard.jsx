import { StarIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import React, { useState } from "react";
import BuyNowModal from "./BuyModal";

export default function ProductCard({ product, onPreview }) {
  const [loading, setLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
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

  return (
    <>
      <div
        onClick={() => onPreview(product)}
        className="border rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      >
        <div className="w-full h-[220px] flex items-center justify-center mb-3">
          <img
            src={product.url || product.imageurl}
            alt={product.name}
            className="h-full max-h-[220px] object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-1">
          Npr. {product.price}
          {product.discount && (
            <span className="text-red-500 ml-2 font-bold">
              ({product.discount} OFF)
            </span>
          )}
        </p>
        {product.desc && (
          <p className="text-xs text-gray-500 mb-1">
            {product.desc.slice(0, 60)}...
          </p>
        )}
        <p className="text-xs text-green-600 mb-2">
          {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
        </p>

        {product.rating && (
          <div className="flex items-center justify-center mb-2">
            {[...Array(product.rating)].map((_, i) => (
              <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`${
              loading ? "bg-blue-300 cursor-wait" : "bg-blue-500 hover:bg-blue-600"
            } text-white text-sm py-1 rounded w-full transition flex justify-center items-center`}
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Add to Cart"
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBuyModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-1 rounded w-full transition"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ✅ Modal for Buy Now */}
      {showBuyModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </>
  );
}
