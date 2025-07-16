import { useNavigate } from "react-router-dom";
import {
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import {
  FaTshirt,
  FaUserEdit,
  FaDumbbell,
} from 'react-icons/fa';

export default function CategoryFilter() {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Electronics',
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-blue-800" />,
      bg: 'bg-blue-100',
      text: 'text-blue-800 font-semibold',
      keyword: 'tech',
    },
    {
      name: 'Fashion',
      icon: <FaTshirt className="w-6 h-6 text-white" />,
      bg: 'bg-indigo-700',
      text: 'text-indigo-700 font-semibold',
      keyword: 'clothes',
    },
    {
      name: 'Custom Shirt',
      icon: <FaUserEdit className="w-6 h-6 text-white" />,
      bg: 'bg-orange-500',
      text: 'text-orange-700 font-semibold',
      keyword: 'shirt',
    },
    {
      name: 'Fitness',
      icon: <FaDumbbell className="w-6 h-6 text-white" />,
      bg: 'bg-pink-500',
      text: 'text-pink-700 font-semibold',
      keyword: 'gym',
    },
  ];

  return (
    <div className="w-full px-5 mt-6">
      <div className="max-w-screen-xl mx-auto flex justify-center gap-8 flex-wrap">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center justify-center space-y-1 transition-transform hover:scale-105 cursor-pointer"
            onClick={() => {
              if (cat.name === 'Custom Shirt') {
                navigate('/custom'); // 👉 special route for custom shirts
              } else {
                navigate(`/category?type=${cat.keyword}`);
              }
            }}
          >
            <div className={`p-3 rounded-full ${cat.bg}`}>
              {cat.icon}
            </div>
            <span className={`text-sm ${cat.text}`}>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
