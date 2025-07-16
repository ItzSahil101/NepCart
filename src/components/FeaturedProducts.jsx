import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal"; // make sure you have this file
import axios from "axios";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // for modal

  useEffect(() => {
    axios
      .get("https://nepcart-backend.onrender.com/api/product")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  return (
    <section className="mt-8 relative z-0">
      <h2
        className="text-lg sm:text-xl font-semibold mb-4"
        style={{ fontSize: "24px" }}
      >
        <b>Featured Products</b>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onPreview={setSelectedProduct} // 👈 FIXED: pass this function
          />
        ))}
      </div>

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
