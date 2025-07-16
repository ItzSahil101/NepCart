// pages/CategoryProducts.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal";
import axios from "axios";
import SortFilterBar from "./SortFilterBar";
import CategoryFilter from "./CategoryFilter";
import HeroBanner from "./HeroBanner";

export default function CategoryProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceFilter, setPriceFilter] = useState("Any");

  const [searchParams] = useSearchParams();
  const categoryKeyword = searchParams.get("type");

  // Fetch all products
  useEffect(() => {
    axios
      .get("https://nepcart-backend.onrender.com/api/product")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Filter by category
  useEffect(() => {
    if (categoryKeyword && products.length > 0) {
      const filteredItems = products.filter((product) =>
        product.category?.toLowerCase().includes(categoryKeyword.toLowerCase())
      );
      setFiltered(filteredItems);
    }
  }, [categoryKeyword, products]);

  // Apply price filter on top of category filter
  const finalProducts = priceFilter === "Any"
    ? filtered
    : filtered.filter((p) => {
        const price = p.price;
        if (!price) return false;
        if (priceFilter === "Under ₹500") return price < 500;
        if (priceFilter === "₹500–1000") return price >= 500 && price <= 1000;
        if (priceFilter === "₹1000+") return price > 1000;
        return true;
      });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <HeroBanner />
      <CategoryFilter />
      <SortFilterBar onPriceChange={setPriceFilter} />

      <section className="mt-8 relative z-0">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          <b>Category: {categoryKeyword?.toUpperCase()}</b>
        </h2>

        {finalProducts.length === 0 ? (
          <p className="text-gray-500">No products found for this filter.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {finalProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onPreview={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {selectedProduct && (
          <ProductPreviewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </section>
    </div>
  );
}
