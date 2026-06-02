import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal"; // make sure you have this file
import axios from "axios";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // for modal
  const [isLoading, setIsLoading] = useState(true); // 👈 New state

  useEffect(() => {
    setIsLoading(true); // start loading
    axios
      .get("https://nepcart-backend.onrender.com/api/product")
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false); // stop loading
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setIsLoading(false); // stop loading even on error
      });
  }, []);

  return (
    <section className="mt-8 relative z-0">
      <h2
        className="text-lg sm:text-xl font-semibold mb-4"
        style={{ fontSize: "24px" }}
      >
        <b>Featured Products</b>
      </h2>

      {/* 👇 Show loading spinner or message */}
      {isLoading ? (
        <div className="text-center text-gray-600 py-10">Loading, please wait...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onPreview={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* ✅ Show modal if product selected */}
      {selectedProduct && (
        <ProductPreviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
