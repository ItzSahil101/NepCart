import React, { useEffect, useState } from "react";
import { ShoppingCartIcon, ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function HeroBanner() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [updates, setUpdates] = useState([]); // store updates from API
  const [loading, setLoading] = useState(false);

  // Fetch total orders (existing code)
  useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const res = await axios.get(
          "https://nepcart-backend.onrender.com/api/product/total-orders"
        );
        setTotalOrders(res.data.totalOrders);
      } catch (err) {
        console.error("Error fetching total orders:", err);
      }
    };
    fetchTotalOrders();
  }, []);

  // Fetch updates when modal opens
  useEffect(() => {
    if (showModal) {
      const fetchUpdates = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            "https://admin-server-2aht.onrender.com/api/extra/update"
          );
          console.log("Fetched updates:", res.data);
          setUpdates(res.data);
        } catch (err) {
          console.error("Error fetching updates:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUpdates();
    }
  }, [showModal]);

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 mt-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-orange-400 via-red-500 to-yellow-300 animate-gradient-x shadow-2xl">
      {/* Text Section */}
      <div className="text-center md:text-left space-y-4 relative">
        <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg uppercase tracking-wide">
          FREE DELIVERY
        </h1>
        <p className="text-yellow-100 text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md animate-pulse">
          Download Our App Now!
        </p>
        <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold mt-2">
          Grab your favorites before they run out!
        </p>

        {/* Buttons Section */}
        <div className="flex flex-col items-center md:items-start mt-4 space-y-4">
          <a
            href="/NepMart.apk"
            download
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-orange-100 active:scale-95 transition-transform duration-200"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
            Download App
          </a>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-white text-gray-800 font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-100 transition-all duration-200"
          >
            See Updates
          </button>
        </div>
      </div>

      {/* Icon Section */}
      <div className="mt-8 md:mt-0">
        <ShoppingCartIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white animate-bounce" />
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-[60%] h-[80%] p-6 relative flex flex-col">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
            >
              <XMarkIcon className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Latest Updates</h2>

            <div className="overflow-y-auto flex-1 space-y-4">
              {loading ? (
                <p className="text-gray-600">Loading updates...</p>
              ) : updates.length === 0 ? (
                <p className="text-gray-600">No updates available.</p>
              ) : (
                updates.map((update, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200"
                  >
                    <p className="text-gray-800 font-medium">
                      • {update.message || update.text || update.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
      `}</style>
    </div>
  );
}
