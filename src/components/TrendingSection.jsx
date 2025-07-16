import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductPreviewModal from "./ProductPreviewModal";
import axios from "axios";
import Loader from "../pages/Loader";
import { getUserFromCookie } from "../utils/getUserFromCookie";

export default function TrendingSection() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    axios
      .get("https://nepcart-backend.onrender.com/api/product")
      .then((res) => {
        const filtered = res.data.filter((p) => p.trending === true);
        setTrendingProducts(filtered);
      })
      .catch((err) =>
        console.error("Error fetching trending products:", err)
      );
  }, []);

  const handleBuyNow = async (product) => {
    const location = prompt("Please enter your delivery location:");
    if (!location || !location.trim()) return alert("Location is required.");

    setPurchaseLoading(true);
    try {
      const user = await getUserFromCookie();
      if (!user?._id) throw new Error("User not found");

      const purchaseData = {
        productId: product._id,
        userId: user._id,
        location,
        totalPrice: product.price,
        products: [
          {
            productId: product._id,
            quantity: 1,
          },
        ],
      };

      const res = await axios.post("https://nepcart-backend.onrender.com/api/purchase", purchaseData, {
        withCredentials: true,
      });

      if (res.status === 201) {
        alert("Order placed successfully ✅");
        setSelectedProduct(null); // Close modal
        window.location.reload(); // Reload page
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Purchase failed ❌");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <section className="mt-10 relative z-0">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Trending</h2>
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <h3 className="font-medium text-sm mb-3">Featured Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onPreview={setSelectedProduct}
            />
          ))}
        </div>
      </div>

      {/* ✅ Modal with Buy Now logic */}
      {selectedProduct && (
        <ProductPreviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        >
          <div className="mt-4">
            {purchaseLoading ? (
              <Loader />
            ) : (
              <button
                onClick={() => handleBuyNow(selectedProduct)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Buy Now
              </button>
            )}
          </div>
        </ProductPreviewModal>
      )}
    </section>
  );
}
