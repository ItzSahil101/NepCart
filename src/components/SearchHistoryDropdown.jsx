import React from 'react';
import { FaClock } from 'react-icons/fa'; // ⏰ History-style icon

const SearchHistoryDropdown = ({ history, onRemove, onSelect, position }) => {
  if (!position || history.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-md w-[90vw] sm:w-[500px]"
      style={{
        top: position.top + 8,
        left: `calc(50% - 45vw)`
      }}
    >
      <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100">
        {history.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            {/* ⏰ Clock icon before text */}
            <FaClock className="text-gray-500 mr-3 shrink-0" />
            <span
              className="text-gray-800 truncate w-full"
              title={item}
            >
              {item.length > 20 ? item.slice(0, 20) + '…' : item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistoryDropdown;
