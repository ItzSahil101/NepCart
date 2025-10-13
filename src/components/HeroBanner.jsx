// src/components/HeroBanner.jsx
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-yellow-300 rounded-xl p-6 mt-4 flex items-center justify-between">
      <div>
        <h1 className="text-white text-3xl sm:text-4xl font-bold">MEGA SALE</h1>
        <p className="text-white text-lg sm:text-xl font-semibold mt-2">FREE DELIVERY</p>
      </div>
      <ShoppingCartIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
    </div>
  )
}
