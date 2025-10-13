import { useNavigate } from "react-router-dom";
import {
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import {
  FaTshirt,
  FaUserEdit,
  FaDumbbell,
  FaListUl,
  FaBook,
  FaUtensils,
} from "react-icons/fa";

export default function CategoryFilter() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "All",
      icon: <FaListUl className="w-6 h-6 text-black" />,
      bg: "bg-gray-200",
      text: "text-gray-800 font-semibold",
      keyword: "",
    },
    {
      name: "Gym + Supplement",
      icon: <FaDumbbell className="w-6 h-6 text-white" />,
      bg: "bg-pink-500",
      text: "text-pink-700 font-semibold",
      keyword: "gym",
    },
    {
      name: "Electronics",
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-blue-800" />,
      bg: "bg-blue-100",
      text: "text-blue-800 font-semibold",
      keyword: "tech",
    },
    {
      name: "Clothes",
      icon: <FaTshirt className="w-6 h-6 text-white" />,
      bg: "bg-indigo-700",
      text: "text-indigo-700 font-semibold",
      keyword: "clothes",
    },
    {
      name: "Gym Wear",
      icon: <FaUserEdit className="w-6 h-6 text-white" />,
      bg: "bg-orange-500",
      text: "text-orange-700 font-semibold",
      keyword: "gw",
    },
    {
      name: "Sports",
      icon: <FaDumbbell className="w-6 h-6 text-white" />,
      bg: "bg-red-500",
      text: "text-red-700 font-semibold",
      keyword: "sport",
    },
    {
      name: "Sketch",
      icon: <FaTshirt className="w-6 h-6 text-white" />,
      bg: "bg-yellow-400",
      text: "text-yellow-700 font-semibold",
      keyword: "sketch",
    },
    {
      name: "Books",
      icon: <FaBook className="w-6 h-6 text-white" />,
      bg: "bg-purple-500",
      text: "text-purple-700 font-semibold",
      keyword: "book",
    },
    {
      name: "Foods",
      icon: <FaUtensils className="w-6 h-6 text-white" />,
      bg: "bg-green-600",
      text: "text-green-700 font-semibold",
      keyword: "food",
    },
  ];

  return (
    <div className="w-full px-5 mt-6">
      <div className="max-w-screen-xl mx-auto flex justify-center gap-8 flex-wrap">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center justify-center space-y-1 transition-transform hover:scale-105 cursor-pointer"
            onClick={() =>
              cat.keyword
                ? navigate(`/category?type=${cat.keyword}`)
                : navigate(`/category`)
            }
          >
            <div className={`p-3 rounded-full ${cat.bg}`}>{cat.icon}</div>
            <span className={`text-sm ${cat.text}`}>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
