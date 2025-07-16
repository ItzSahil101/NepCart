// ✅ components/UploadCustomDesign.jsx
import React, { useState } from "react";
import axios from "axios";
import { getUserFromCookie } from "../utils/getUserFromCookie";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function UploadCustomDesign() {
  const [image, setImage] = useState(null);
  const [color, setColor] = useState("white");
  const [location, setLocation] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handlePlaceOrder = async () => {
    const user = await getUserFromCookie();
    if (!user) return alert("Please login first");

    if (!image || !color || !location) {
      return alert("Please fill all fields");
    }

    try {
      const res = await axios.post("https://nepcart-backend.onrender.com/orderc", {
        userId: user._id,
        location,
        totalPrice: 999,
        tshirtColor: color,
        imageUrl: image,
      });

      alert("Order placed successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-100 via-white to-blue-100 p-6 rounded-md mt-4 shadow-lg border border-orange-300">
      <h2 className="text-2xl font-bold text-orange-600 text-center mb-2">
        Print Customized T-Shirt Just for You 👕🔥
      </h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Upload your design, choose your t-shirt color, enter your location and place the order for just ₹999.
      </p>

      {/* Upload Image Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-md p-6 cursor-pointer hover:border-orange-500 transition-all">
        {image ? (
          <img
            src={image}
            alt="Uploaded"
            className="h-40 object-contain rounded mb-2"
          />
        ) : (
          <div className="flex flex-col items-center">
            <PlusIcon className="w-10 h-10 text-blue-500" />
            <p className="text-sm text-blue-600 mt-2">Click to upload your design</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setImage(reader.result);
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
        />
      </label>

      {/* Color Selection */}
      <div className="flex gap-2 sm:gap-4 my-6 justify-center flex-wrap">
        {[
          { name: "white", color: "bg-white border" },
          { name: "black", color: "bg-black text-white" },
          { name: "gray", color: "bg-gray-400 text-white" },
          { name: "green", color: "bg-green-500 text-white" },
          { name: "blue", color: "bg-blue-500 text-white" },
        ].map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c.name)}
            className={`px-4 py-2 rounded shadow-sm border ${
              color === c.name
                ? "ring-2 ring-orange-500 scale-105"
                : "hover:scale-105"
            } transition-all duration-200 ${c.color}`}
          >
            {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
          </button>
        ))}
      </div>

      {/* Location Input */}
      <input
        type="text"
        placeholder="Enter delivery location..."
        className="w-full border border-blue-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      {/* Place Order Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-full transition-all shadow-md"
        >
          Place Order ₹999
        </button>
      </div>

      {/* Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md z-50">
            <h2 className="text-xl font-bold text-orange-600 mb-4 text-center">
              Confirm Your Order
            </h2>
            <p><b>Color:</b> {color}</p>
            <p><b>Location:</b> {location}</p>
            <p><b>Total Price:</b> ₹999</p>
            {image && (
              <img src={image} alt="Design" className="w-32 mt-3 rounded border" />
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={handlePlaceOrder}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
