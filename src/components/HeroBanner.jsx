// src/components/HeroBanner.jsx
import {
  ShoppingCartIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-8 mt-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-orange-400 via-red-500 to-yellow-300 animate-gradient-x shadow-2xl">
      {/* Text Section */}
      <div className="text-center md:text-left space-y-4">
        <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg uppercase tracking-wide">
          FREE DELIVERY
        </h1>
        <p className="text-yellow-100 text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md animate-pulse">
          Download Our App Now!
        </p>
        <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold mt-2">
          Grab your favorites before they run out!
        </p>

        <a
          href="/NepMart.apk"
          download
          className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-orange-100 active:scale-95 transition-transform duration-200 mt-4"
        >
          <ArrowDownTrayIcon className="w-6 h-6" />
          Download App-
        </a>
      </div>

      {/* Icon Section */}
      <div className="mt-8 md:mt-0">
        <ShoppingCartIcon className="w-20 h-20 sm:w-24 sm:h-24 text-white animate-bounce" />
      </div>

      {/* Optional Gradient Animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
      `}</style>
    </div>
  );
}
