// ✅ src/pages/CustomProducts.jsx
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal";
import HeroBanner from "./HeroBanner";
import SortFilterBar from "./SortFilterBar";
import CategoryFilter from "./CategoryFilter";
import Loader from "../pages/Loader";
import UploadCustomDesign from "../components/UploadCustomDesign"; // ✅ new
import axios from "axios";

export default function CustomProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceFilter, setPriceFilter] = useState("Any");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://nepcart-backend.onrender.com/custom")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error("Error fetching custom products:", err))
      .finally(() => setLoading(false));
  }, []);

  const finalProducts =
    priceFilter === "Any"
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

      {/* ✅ Upload Section */}
      <UploadCustomDesign />

      <section className="mt-8 relative z-0">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          <b>Category: CUSTOM PRODUCTS</b>
        </h2>

        {loading ? (
          <Loader />
        ) : finalProducts.length === 0 ? (
          <p className="text-gray-500">No custom products found.</p>
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