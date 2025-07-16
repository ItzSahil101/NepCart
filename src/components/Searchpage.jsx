import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal";
import HeroBanner from "./HeroBanner";
import CategoryFilter from "./CategoryFilter";
import SortFilterBar from "./SortFilterBar";

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceFilter, setPriceFilter] = useState("any");
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("query")?.toLowerCase();

  useEffect(() => {
    axios
      .get("https://nepcart-backend.onrender.com/api/product")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    if (searchQuery && products.length > 0) {
      let result = products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const keywords = product.keywords?.join(" ").toLowerCase() || "";
        return (
          name.includes(searchQuery) ||
          category.includes(searchQuery) ||
          keywords.includes(searchQuery)
        );
      });

      // ✅ Apply price filter
      if (priceFilter !== "any") {
        result = result.filter((product) => {
          const price = product.price || 0;
          if (priceFilter === "under500") return price < 500;
          if (priceFilter === "500to1000") return price >= 500 && price <= 1000;
          if (priceFilter === "above1000") return price > 1000;
          return true;
        });
      }

      setFiltered(result);
    }
  }, [searchQuery, products, priceFilter]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <HeroBanner />
      <CategoryFilter />
      <SortFilterBar onPriceChange={setPriceFilter} />

      <section className="mt-8 relative z-0">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          <b>Search results for: {searchQuery}</b>
        </h2>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No products found matching "{searchQuery}".</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filtered.map((product) => (
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
