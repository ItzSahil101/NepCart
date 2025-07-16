// src/pages/Home.jsx
import HeroBanner from '../components/HeroBanner'
import CategoryFilter from '../components/CategoryFilter'
import SortFilterBar from '../components/SortFilterBar'
import FeaturedProducts from '../components/FeaturedProducts'
import TrendingSection from '../components/TrendingSection'

export default function Home() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <HeroBanner />
      <CategoryFilter />
      <SortFilterBar />
      <FeaturedProducts />
      <TrendingSection />
    </div>
  )
}
