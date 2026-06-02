import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import SearchHistoryDropdown from "./SearchHistoryDropdown"
import { Link } from "react-router-dom";

import axios from "axios";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const inputRef = useRef(null);

  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
const profileRef = useRef(null);


  // ⏬ Load localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(saved.slice(0, 4));
  }, []);

  useEffect(()=>{
    const handleOutsideProfileClick = (e) => {
  if (!e.target.closest(".profile-menu-container")) {
    setShowProfileMenu(false);
  }
};
document.addEventListener("mousedown", handleOutsideProfileClick);
return () => document.removeEventListener("mousedown", handleOutsideProfileClick);

  })

  const handleSearch = () => {
  if (search.trim()) {
    const updated = [search, ...history.filter((item) => item !== search)].slice(0, 4);
    setHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
    setShowDropdown(false);
    navigate(`/search?query=${encodeURIComponent(search.trim())}`); // ✅ Navigate to /search
  }
};


  // ✅ Delete history item
  const handleRemove = (term) => {
    const updated = history.filter((item) => item !== term);
    setHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  // ✅ Fill input with clicked history
  const handleSelectHistory = (term) => {
    setSearch(term);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // ✅ Open dropdown on input focus
  const handleInputFocus = () => {
    if (inputRef.current && history.length > 0) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
      });
      setShowDropdown(true);
    }
  };

  // ✅ Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest(".search-container")) {
      setShowDropdown(false);
    }
  };

 const handleLogout = async () => {
  try {
    await axios.post(
      "https://nepcart-backend.onrender.com/api/auth/logout",
      {},
      { withCredentials: true }
    );
    navigate("/log");
    alert("Logout sucessfully!!")
  } catch (err) {
    console.error("Logout error", err);
    alert("Failed to logout");
  }
};
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-blue-600 text-white px-4 py-3 shadow-md flex items-center justify-between gap-3 w-full relative z-20">
        {/* LEFT: LOGO */}
        <div className="flex items-center space-x-2 shrink-0">
          <FaShoppingCart className="text-2xl" />
          <Link className="text-xl font-bold tracking-wide font-serif whitespace-nowrap" to="/">
            NepMart
          </Link>
        </div>

        {/* CENTER: SEARCH */}
        <div className="flex-grow min-w-0 px-2 relative search-container">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search in NepCart"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={handleInputFocus}
              className="w-full py-2 pl-4 pr-11 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base truncate"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700 text-xl cursor-pointer hover:text-blue-900 z-10"
              onClick={handleSearch}
            >
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700 text-xl cursor-pointer hover:text-blue-900" />
            </button>
          </div>
        </div>

        {/* RIGHT: ICONS */}
        <div className="flex items-center space-x-4 shrink-0 ml-2">
          <Link to="/cart"><FaShoppingCart className="text-2xl hover:text-gray-200 cursor-pointer" /> </Link>
           <div className="relative profile-menu-container" ref={profileRef}>
  <button
    onClick={() => setShowProfileMenu((prev) => !prev)}
    className="text-2xl hover:text-gray-200 cursor-pointer"
  >
    <FaUser />
  </button>

  {showProfileMenu && (
    <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg py-2 z-50">
      <Link to="/profile"><button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
        <FaUser className="mr-2" /> Profile
      </button>  </Link>
      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </button>
    </div>
  )}
</div>

        </div>
      </nav>

      {/* DROPDOWN OUTSIDE NAVBAR */}
      {showDropdown && (
        <SearchHistoryDropdown
          history={history}
          onRemove={handleRemove}
          onSelect={handleSelectHistory}
          position={dropdownPos}
        />
      )}
    </>
  );
};

export default Navbar;
