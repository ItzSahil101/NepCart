import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-20 h-20 animate-spin-slow rounded-full border-8 border-t-transparent border-b-transparent border-l-purple-500 border-r-pink-500">
        {/* Bouncing dots inside */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="w-4 h-4 bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
